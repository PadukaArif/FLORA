#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <esp_now.h>
#include <esp_wifi.h>
#include <ArduTFLite.h>

#include "config.h"
#include "grenvis_sensor_model.h"

#define DHT_PIN 4
#define DHT_TYPE DHT22

// Sesuaikan dua macro ini bila nama array/ukuran pada header model asli berbeda.
#ifndef GRENVIS_MODEL_DATA
#define GRENVIS_MODEL_DATA grenvis_sensor_model_tflite
#endif
#ifndef GRENVIS_MODEL_LEN
#define GRENVIS_MODEL_LEN grenvis_sensor_model_tflite_len
#endif

constexpr uint32_t SENSOR_INTERVAL_MS = 5000;
constexpr uint32_t MQTT_INTERVAL_MS = 5000;
constexpr uint32_t VISION_TIMEOUT_MS = 15000;
constexpr uint32_t WIFI_RETRY_MS = 10000;
constexpr uint32_t MQTT_RETRY_MS = 5000;
constexpr size_t TENSOR_ARENA_SIZE = 16 * 1024;

// WAJIB identik dengan ESP32-CAM.
typedef struct VisionMessage {
  float healthy;
  float powdery;
  float rust;
  char prediction[16];
} VisionMessage;

struct SensorState {
  float temperature = NAN;
  float humidity = NAN;
  float soilMoisture = 70.0f;
  float probability[3] = {0, 0, 0}; // High, Low, Moderate
  char risk[12] = "Unknown";
  float confidence = 0;
  bool valid = false;
};

DHT dht(DHT_PIN, DHT_TYPE);
WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);
alignas(16) byte tensorArena[TENSOR_ARENA_SIZE];

SensorState sensor;
VisionMessage vision = {};
portMUX_TYPE visionMux = portMUX_INITIALIZER_UNLOCKED;
volatile bool newVisionData = false;
volatile uint32_t lastVisionReceived = 0;
uint8_t lastCamMac[6] = {};

uint32_t lastSensorRead = 0;
uint32_t lastPublish = 0;
uint32_t lastWifiAttempt = 0;
uint32_t lastMqttAttempt = 0;
bool modelReady = false;

String macToString(const uint8_t *mac) {
  char value[18];
  snprintf(value, sizeof(value), "%02X:%02X:%02X:%02X:%02X:%02X",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  return String(value);
}

void onEspNowReceive(const esp_now_recv_info_t *info,
                     const uint8_t *incomingData, int len) {
  if (info == nullptr || incomingData == nullptr || len != sizeof(VisionMessage)) return;

  VisionMessage incoming;
  memcpy(&incoming, incomingData, sizeof(incoming));
  incoming.prediction[sizeof(incoming.prediction) - 1] = '\0';

  portENTER_CRITICAL_ISR(&visionMux);
  memcpy(&vision, &incoming, sizeof(vision));
  memcpy(lastCamMac, info->src_addr, sizeof(lastCamMac));
  lastVisionReceived = millis();
  newVisionData = true;
  portEXIT_CRITICAL_ISR(&visionMux);
}

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  uint32_t now = millis();
  if (now - lastWifiAttempt < WIFI_RETRY_MS) return;
  lastWifiAttempt = now;
  Serial.println("WiFi          : CONNECTING");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

void connectMqtt() {
  if (WiFi.status() != WL_CONNECTED || mqttClient.connected()) return;
  uint32_t now = millis();
  if (now - lastMqttAttempt < MQTT_RETRY_MS) return;
  lastMqttAttempt = now;

  String clientId = "grenvis-main-" + String((uint32_t)(ESP.getEfuseMac() & 0xFFFFFFFF), HEX);
  // Retained LWT menandai offline jika koneksi terputus tidak normal.
  bool ok = mqttClient.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD,
                               MQTT_STATUS_TOPIC, 1, true, "offline");
  Serial.printf("MQTT          : %s\n", ok ? "CONNECTED" : "FAILED");
  if (ok) mqttClient.publish(MQTT_STATUS_TOPIC, "online", true);
}

void readSensorsAndInfer() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  if (isnan(humidity) || isnan(temperature)) {
    sensor.valid = false;
    Serial.println("DHT22         : READ FAILED (nilai lama tidak dipublish)");
    return;
  }

  sensor.temperature = temperature;
  sensor.humidity = humidity;
  // SIMULATION: ganti baris ini dengan pembacaan dan kalibrasi sensor tanah asli.
  sensor.soilMoisture = 70.0f;

  if (!modelReady) {
    sensor.valid = false;
    return;
  }

  // StandardScaler model asli. Jangan ubah urutan: temperature, humidity, soil.
  const float mean[3] = {28.62221905f, 59.83464446f, 67.15121274f};
  const float stddev[3] = {4.90833472f, 14.30678582f, 17.56037094f};
  const float raw[3] = {sensor.temperature, sensor.humidity, sensor.soilMoisture};
  for (int i = 0; i < 3; ++i) modelSetInput((raw[i] - mean[i]) / stddev[i], i);

  if (!modelRunInference()) {
    sensor.valid = false;
    Serial.println("Sensor ML     : INFERENCE FAILED");
    return;
  }

  const char *labels[3] = {"High", "Low", "Moderate"};
  int best = 0;
  for (int i = 0; i < 3; ++i) {
    sensor.probability[i] = modelGetOutput(i) * 100.0f;
    if (sensor.probability[i] > sensor.probability[best]) best = i;
  }
  snprintf(sensor.risk, sizeof(sensor.risk), "%s", labels[best]);
  sensor.confidence = sensor.probability[best];
  sensor.valid = true;

  Serial.printf("T/H/Soil      : %.2f C / %.2f %% / %.2f %%\n", temperature, humidity, sensor.soilMoisture);
  Serial.printf("Risk          : %s (%.2f %%) [H %.2f, L %.2f, M %.2f]\n",
                sensor.risk, sensor.confidence, sensor.probability[0],
                sensor.probability[1], sensor.probability[2]);
}

bool visionIsLive(uint32_t now) {
  uint32_t received;
  portENTER_CRITICAL(&visionMux);
  received = lastVisionReceived;
  portEXIT_CRITICAL(&visionMux);
  return received != 0 && (now - received <= VISION_TIMEOUT_MS);
}

void publishTelemetry() {
  if (!mqttClient.connected() || !sensor.valid) return;

  VisionMessage visionCopy;
  uint8_t camMacCopy[6];
  portENTER_CRITICAL(&visionMux);
  memcpy(&visionCopy, &vision, sizeof(visionCopy));
  memcpy(camMacCopy, lastCamMac, sizeof(camMacCopy));
  portEXIT_CRITICAL(&visionMux);

  const bool live = visionIsLive(millis());
  const String mainMac = WiFi.macAddress();
  const String camMac = live ? macToString(camMacCopy) : "";
  char payload[1536];
  int written = snprintf(payload, sizeof(payload),
    "{\"temperature\":%.2f,\"humidity\":%.2f,\"soil_moisture\":%.2f,"
    "\"temperature_status\":\"UNCONFIGURED\",\"humidity_status\":\"UNCONFIGURED\","
    "\"soil_status\":\"UNCONFIGURED\",\"sensor_risk\":\"%s\","
    "\"sensor_confidence\":%.2f,\"high_probability\":%.2f,"
    "\"low_probability\":%.2f,\"moderate_probability\":%.2f,"
    "\"vision_connected\":%s,\"vision_healthy\":%.2f,"
    "\"vision_powdery\":%.2f,\"vision_rust\":%.2f,"
    "\"vision_prediction\":\"%s\",\"esp32_mac\":\"%s\","
    "\"esp32cam_mac\":\"%s\",\"wifi_channel\":%d,\"uptime_seconds\":%lu}",
    sensor.temperature, sensor.humidity, sensor.soilMoisture, sensor.risk,
    sensor.confidence, sensor.probability[0], sensor.probability[1],
    sensor.probability[2], live ? "true" : "false",
    live ? visionCopy.healthy : 0.0f, live ? visionCopy.powdery : 0.0f,
    live ? visionCopy.rust : 0.0f, live ? visionCopy.prediction : "STALE",
    mainMac.c_str(), camMac.c_str(), WiFi.channel(), millis() / 1000UL);

  if (written < 0 || written >= (int)sizeof(payload)) {
    Serial.println("MQTT          : PAYLOAD TOO LARGE");
    return;
  }
  bool ok = mqttClient.publish(MQTT_DATA_TOPIC, payload, false);
  Serial.printf("Telemetry     : %s (%d bytes)\n", ok ? "PUBLISHED" : "FAILED", written);
}

void printDeviceStatus() {
  Serial.println("================================");
  Serial.println("GRENVIS ESP32 MAIN");
  Serial.println("================================");
  Serial.printf("ESP32 MAC     : %s\n", WiFi.macAddress().c_str());
  Serial.printf("IP Address    : %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("WiFi Channel  : %d\n", WiFi.channel());
  Serial.println("ESP-NOW       : READY");
  Serial.printf("MQTT          : %s\n", mqttClient.connected() ? "CONNECTED" : "DISCONNECTED");
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Menunggu WiFi agar channel ESP-NOW sinkron");
  uint32_t started = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - started < 20000) {
    delay(250); // Hanya saat boot; loop utama tetap non-blocking.
    Serial.print('.');
  }
  Serial.println();

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("FATAL         : WiFi gagal; ESP-NOW tidak dimulai agar channel tidak salah");
    return;
  }

  if (esp_now_init() != ESP_OK || esp_now_register_recv_cb(onEspNowReceive) != ESP_OK) {
    Serial.println("FATAL         : ESP-NOW init/callback gagal");
    return;
  }

  // Prototype saja. Production: pasang CA certificate dengan setCACert().
  secureClient.setInsecure();
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setBufferSize(2048);
  mqttClient.setKeepAlive(30);

  modelReady = modelInit(GRENVIS_MODEL_DATA, tensorArena, TENSOR_ARENA_SIZE);
  Serial.printf("Sensor ML     : %s (model bytes: %u)\n", modelReady ? "READY" : "INIT FAILED",
                (unsigned)GRENVIS_MODEL_LEN);
  printDeviceStatus();
}

void loop() {
  connectWifi();
  connectMqtt();
  mqttClient.loop();

  uint32_t now = millis();
  if (now - lastSensorRead >= SENSOR_INTERVAL_MS) {
    lastSensorRead = now;
    readSensorsAndInfer();
  }
  if (now - lastPublish >= MQTT_INTERVAL_MS) {
    lastPublish = now;
    publishTelemetry();
  }
  if (newVisionData) {
    portENTER_CRITICAL(&visionMux);
    newVisionData = false;
    VisionMessage copy = vision;
    portEXIT_CRITICAL(&visionMux);
    Serial.printf("Vision RX     : %s H %.2f P %.2f R %.2f\n",
                  copy.prediction, copy.healthy, copy.powdery, copy.rust);
  }
}
