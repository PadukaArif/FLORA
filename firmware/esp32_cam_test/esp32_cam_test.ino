#include <Arduino.h>
#include <WiFi.h>
#include <esp_now.h>
#include "config.h"

constexpr uint32_t SEND_INTERVAL_MS = 5000;

typedef struct VisionMessage {
  float healthy;
  float powdery;
  float rust;
  char prediction[16];
} VisionMessage;

VisionMessage testVision = {10.0f, 20.0f, 70.0f, "Rust"};
uint32_t lastSend = 0;
bool espNowReady = false;

String macToString(const uint8_t *mac) {
  char value[18];
  snprintf(value, sizeof(value), "%02X:%02X:%02X:%02X:%02X:%02X",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  return String(value);
}

bool macConfigured() {
  for (uint8_t value : mainEsp32Mac) if (value != 0) return true;
  return false;
}

void printHeader() {
  Serial.println("================================");
  Serial.println("GRENVIS ESP32-CAM");
  Serial.println("================================");
  Serial.printf("CAM MAC       : %s\n", WiFi.macAddress().c_str());
  Serial.printf("MAIN ESP32    : %s\n", macToString(mainEsp32Mac).c_str());
  Serial.printf("CHANNEL       : %d\n", WiFi.channel());
  Serial.printf("ESP-NOW       : %s\n", espNowReady ? "READY" : "FAILED");
}

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // Bergabung ke AP yang sama membuat channel CAM selalu sama dengan ESP32 Main.
  uint32_t started = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - started < 20000) {
    delay(250);
  }
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("FATAL: WiFi gagal. ESP-NOW tidak dimulai untuk mencegah channel berbeda.");
    return;
  }
  if (!macConfigured()) {
    Serial.println("FATAL: mainEsp32Mac masih 00:00:00:00:00:00. Isi config.h.");
    return;
  }
  if (esp_now_init() != ESP_OK) {
    Serial.println("FATAL: ESP-NOW init gagal.");
    return;
  }

  esp_now_peer_info_t peer = {};
  memcpy(peer.peer_addr, mainEsp32Mac, 6);
  peer.channel = WiFi.channel();
  peer.encrypt = false;
  peer.ifidx = WIFI_IF_STA;
  espNowReady = esp_now_add_peer(&peer) == ESP_OK;
  printHeader();
}

void loop() {
  if (!espNowReady) return;

  uint32_t now = millis();
  if (now - lastSend < SEND_INTERVAL_MS) return;
  lastSend = now;

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("ESP-NOW SEND SKIPPED: WiFi terputus; channel tidak dapat dijamin sama.");
    WiFi.reconnect();
    return;
  }

  Serial.printf("\nHealthy       : %.2f%%\n", testVision.healthy);
  Serial.printf("Powdery       : %.2f%%\n", testVision.powdery);
  Serial.printf("Rust          : %.2f%%\n", testVision.rust);
  Serial.printf("Prediction    : %s\n", testVision.prediction);

  esp_err_t result = esp_now_send(mainEsp32Mac,
                                  reinterpret_cast<const uint8_t *>(&testVision),
                                  sizeof(testVision));
  // SUCCESS berarti paket diterima stack ESP-NOW untuk dikirim. Konfirmasi end-to-end
  // tetap dilihat dari log "Vision RX" pada ESP32 Main.
  Serial.println(result == ESP_OK ? "ESP-NOW SEND SUCCESS" : "ESP-NOW SEND FAILED");
}

