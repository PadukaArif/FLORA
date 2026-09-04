const express = require('express');
const mqtt = require('mqtt');
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT || 3000);
const dataDir = path.join(__dirname, 'data');
const historyFile = path.join(dataDir, 'history.json');
const wateringFile = path.join(dataDir, 'watering-events.json');
fs.mkdirSync(dataDir, { recursive: true });

const readJson = (file, fallback = []) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
};
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2));
let history = readJson(historyFile).slice(-5000);
let wateringEvents = readJson(wateringFile);
let mqttState = 'DISCONNECTED';
let lastTelemetryAt = history.at(-1)?.timestamp || null;

const cfg = {
  soilDry: Number(process.env.SOIL_DRY || 30),
  soilVeryDry: Number(process.env.SOIL_VERY_DRY || 20),
  soilWet: Number(process.env.SOIL_WET || 80),
  tempHigh: Number(process.env.TEMP_HIGH || 35),
  humidityLow: Number(process.env.HUMIDITY_LOW || 45),
  humidityHigh: Number(process.env.HUMIDITY_HIGH || 80),
  consecutive: Number(process.env.CONSECUTIVE_REQUIRED || 3)
};

const round = (n, d = 2) => Number(Number(n || 0).toFixed(d));
const validNumber = (n) => Number.isFinite(Number(n));
const dominant = (row) => {
  const choices = [['Healthy', row.vision_healthy], ['Powdery', row.vision_powdery], ['Rust', row.vision_rust]];
  return choices.sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))[0][0];
};
const trend = (rows, field) => {
  const values = rows.map(r => Number(r[field])).filter(Number.isFinite);
  if (values.length < 3) return 'INSUFFICIENT_DATA';
  const slope = (values.at(-1) - values[0]) / (values.length - 1);
  if (Math.abs(slope) < 0.4) return 'STABLE';
  return slope > 0 ? 'INCREASING' : 'DECREASING';
};

function derive(record, rows) {
  const recent = [...rows.slice(-(cfg.consecutive - 1)), record];
  const dryRows = recent.filter(r => Number(r.soil_moisture) < cfg.soilDry);
  const wetRows = recent.filter(r => Number(r.soil_moisture) > cfg.soilWet);
  const consecutiveDry = dryRows.length === recent.length ? dryRows.length : 0;
  let drySince = null;
  if (Number(record.soil_moisture) < cfg.soilDry) {
    for (let i = rows.length - 1; i >= 0; i--) {
      if (Number(rows[i].soil_moisture) >= cfg.soilDry) break;
      drySince = rows[i].timestamp;
    }
    drySince ||= record.timestamp;
  }
  const dryMinutes = drySince ? Math.max(0, Math.round((Date.parse(record.timestamp) - Date.parse(drySince)) / 60000)) : 0;

  let wateringStatus = 'NO_WATERING';
  let wateringPriority = 'LOW';
  let wateringDescription = 'Kelembapan tanah masih mencukupi berdasarkan data terbaru.';
  let nextCheckMinutes = 60;
  if (wetRows.length === recent.length && recent.length >= cfg.consecutive) {
    wateringStatus = 'TOO_WET';
    wateringPriority = 'MEDIUM';
    wateringDescription = 'Media tanam terdeteksi sangat lembap secara konsisten. Tunda penyiraman dan periksa drainase.';
    nextCheckMinutes = 30;
  } else if (consecutiveDry >= cfg.consecutive) {
    wateringStatus = 'WATERING_RECOMMENDED';
    wateringPriority = 'MEDIUM';
    wateringDescription = 'Kelembapan tanah terdeteksi rendah secara konsisten. Periksa tanaman dan pertimbangkan penyiraman.';
    nextCheckMinutes = 30;
    if (Number(record.soil_moisture) < cfg.soilVeryDry && Number(record.temperature) >= cfg.tempHigh && Number(record.humidity) <= cfg.humidityLow) {
      wateringStatus = 'URGENT_CHECK';
      wateringPriority = 'HIGH';
      wateringDescription = 'Tanah sangat kering disertai suhu tinggi dan kelembapan udara rendah. Segera lakukan pemeriksaan fisik kebutuhan air.';
      nextCheckMinutes = 15;
    }
  } else if (Number(record.soil_moisture) < cfg.soilDry) {
    wateringStatus = 'MONITOR';
    wateringDescription = 'Satu pembacaan tanah rendah terdeteksi. Tunggu pembacaan berikutnya untuk memastikan kondisi konsisten.';
    nextCheckMinutes = 15;
  }

  const visual = dominant(record);
  const persistentVisual = recent.length >= cfg.consecutive && recent.every(r => dominant(r) === visual);
  let condition = 'Healthy / Stable';
  let description = 'Tidak terdapat indikasi visual penyakit yang dominan dan kondisi lingkungan relatif stabil.';
  let factors = ['Perubahan alami kondisi tanaman dan lingkungan'];
  let actions = ['Continue routine monitoring'];
  let priority = 'LOW';
  if (visual === 'Rust') {
    condition = 'Possible Rust Indication';
    description = 'AI Vision menemukan pola visual yang menyerupai gejala Rust. Hasil ini bukan diagnosis pasti.';
    factors = ['Kelembapan lingkungan', 'Kebersihan area tanaman', 'Perubahan kondisi daun'];
    actions = ['Periksa daun yang terindikasi', 'Pantau perubahan pola visual', 'Jaga kebersihan area tanaman'];
    priority = persistentVisual ? 'MEDIUM' : 'LOW';
  } else if (visual === 'Powdery') {
    condition = 'Possible Powdery Mildew Indication';
    description = 'AI Vision menemukan pola visual yang menyerupai Powdery Mildew. Diperlukan pemeriksaan langsung.';
    factors = ['Kelembapan tinggi', 'Daun lembap', 'Sirkulasi udara kurang baik'];
    actions = ['Periksa fisik daun', 'Evaluasi sirkulasi udara', 'Hindari kelembapan berlebihan'];
    priority = persistentVisual ? 'MEDIUM' : 'LOW';
  }
  if (persistentVisual && record.sensor_risk === 'High') priority = 'HIGH';

  return {
    ...record,
    temperature_status: Number(record.temperature) >= cfg.tempHigh ? 'HIGH' : 'NORMAL',
    humidity_status: Number(record.humidity) >= cfg.humidityHigh ? 'HIGH' : Number(record.humidity) <= cfg.humidityLow ? 'LOW' : 'NORMAL',
    soil_status: Number(record.soil_moisture) < cfg.soilDry ? 'DRY' : Number(record.soil_moisture) > cfg.soilWet ? 'WET' : 'NORMAL',
    dry_since: drySince,
    dry_duration_minutes: dryMinutes,
    consecutive_dry_readings: consecutiveDry,
    watering_status: wateringStatus,
    watering_priority: wateringPriority,
    watering_description: wateringDescription,
    next_check_time: new Date(Date.parse(record.timestamp) + nextCheckMinutes * 60000).toISOString(),
    condition: { title: condition, description, factors, actions, priority, recommended_inspection: 'Lakukan pemeriksaan langsung pada daun dan media tanam yang terindikasi.' }
  };
}

function normalize(payload) {
  if (!validNumber(payload.temperature) || !validNumber(payload.humidity) || !validNumber(payload.soil_moisture)) throw new Error('Telemetry sensor tidak valid');
  return {
    ...payload,
    timestamp: payload.timestamp && !Number.isNaN(Date.parse(payload.timestamp)) ? new Date(payload.timestamp).toISOString() : new Date().toISOString(),
    temperature: Number(payload.temperature), humidity: Number(payload.humidity), soil_moisture: Number(payload.soil_moisture),
    vision_healthy: Number(payload.vision_healthy || 0), vision_powdery: Number(payload.vision_powdery || 0), vision_rust: Number(payload.vision_rust || 0)
  };
}

function ingest(payload) {
  const record = derive(normalize(payload), history);
  history.push(record);
  history = history.slice(-5000);
  lastTelemetryAt = record.timestamp;
  writeJson(historyFile, history);
  broadcast({ type: 'telemetry', data: record });
  return record;
}

function summary(rows) {
  const values = field => rows.map(r => Number(r[field])).filter(Number.isFinite);
  const stats = field => { const v = values(field); return { average: round(v.reduce((a,b)=>a+b,0) / (v.length || 1)), minimum: v.length ? Math.min(...v) : 0, maximum: v.length ? Math.max(...v) : 0 }; };
  const count = (field, value) => rows.filter(r => String(r[field]).toLowerCase() === value.toLowerCase()).length;
  const visionCounts = { Healthy: rows.filter(r=>dominant(r)==='Healthy').length, Powdery: rows.filter(r=>dominant(r)==='Powdery').length, Rust: rows.filter(r=>dominant(r)==='Rust').length };
  const dominantVision = Object.entries(visionCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Unknown';
  const riskCounts = { Low: count('sensor_risk','Low'), Moderate: count('sensor_risk','Moderate'), High: count('sensor_risk','High') };
  return {
    readings: rows.length, temperature: stats('temperature'), humidity: stats('humidity'), soil: stats('soil_moisture'),
    vision: { healthy: stats('vision_healthy'), powdery: stats('vision_powdery'), rust: stats('vision_rust'), counts: visionCounts, dominant: dominantVision },
    environmental: { counts: riskCounts, dominant: Object.entries(riskCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Unknown' },
    watering: { dry_events: rows.filter((r,i)=>r.soil_status==='DRY' && rows[i-1]?.soil_status!=='DRY').length, wet_events: rows.filter((r,i)=>r.soil_status==='WET' && rows[i-1]?.soil_status!=='WET').length, recommendations: rows.filter(r=>['WATERING_RECOMMENDED','URGENT_CHECK'].includes(r.watering_status)).length, events: wateringEvents.length },
    trends: { soil: trend(rows,'soil_moisture'), rust: trend(rows,'vision_rust'), powdery: trend(rows,'vision_powdery') }
  };
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/state', (req, res) => {
  const cutoff = Date.now() - 24 * 3600000;
  const daily = history.filter(r => Date.parse(r.timestamp) >= cutoff);
  res.json({ latest: history.at(-1) || null, history: history.slice(-288), summary: summary(daily), mqtt: mqttState, lastTelemetryAt, config: cfg, wateringEvents: wateringEvents.slice(-20) });
});
app.post('/api/watering', (req, res) => {
  const latest = history.at(-1);
  const event = { id: Date.now(), timestamp: new Date().toISOString(), soil_before: latest?.soil_moisture ?? null, note: String(req.body.note || '').slice(0, 200) };
  wateringEvents.push(event); writeJson(wateringFile, wateringEvents); broadcast({type:'watering', data:event}); res.status(201).json(event);
});
app.post('/api/demo', (req, res) => res.status(201).json(ingest(req.body)));

const server = app.listen(port, () => console.log(`FLORA dashboard: http://localhost:${port}`));
const wss = new WebSocketServer({ server, path: '/live' });
function broadcast(message) { const text = JSON.stringify(message); for (const client of wss.clients) if (client.readyState === 1) client.send(text); }

const mqttUrl = process.env.MQTT_URL;
if (mqttUrl) {
  const client = mqtt.connect(mqttUrl, {
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined,
    rejectUnauthorized: String(process.env.MQTT_REJECT_UNAUTHORIZED || 'true') === 'true',
    reconnectPeriod: 5000
  });
  client.on('connect', () => { mqttState = 'CONNECTED'; client.subscribe([process.env.MQTT_TOPIC || 'grenvis/sensor/data', process.env.MQTT_STATUS_TOPIC || 'grenvis/sensor/status']); broadcast({type:'mqtt', data:mqttState}); });
  client.on('reconnect', () => { mqttState = 'RECONNECTING'; });
  client.on('offline', () => { mqttState = 'DISCONNECTED'; broadcast({type:'mqtt', data:mqttState}); });
  client.on('error', err => console.error('MQTT:', err.message));
  client.on('message', (topic, buffer) => {
    if (topic === (process.env.MQTT_STATUS_TOPIC || 'grenvis/sensor/status')) return;
    try { ingest(JSON.parse(buffer.toString())); } catch (err) { console.error('Telemetry ditolak:', err.message); }
  });
} else {
  console.log('MQTT nonaktif: isi MQTT_URL di dashboard/.env untuk menghubungkan broker.');
}

if (String(process.env.DEMO_MODE || 'true') === 'true' && !history.length) {
  const samples = 36;
  for (let i = samples; i > 0; i--) {
    const x = samples - i;
    ingest({ timestamp: new Date(Date.now() - i * 5 * 60000).toISOString(), temperature: 29 + x * .08 + Math.sin(x)*.5, humidity: 72 - x*.2, soil_moisture: 68 - x*1.15, sensor_risk: x > 27 ? 'High' : 'Moderate', sensor_confidence: 94.2, high_probability: x > 27 ? 91 : 3, low_probability: 2, moderate_probability: x > 27 ? 7 : 95, vision_connected: true, vision_healthy: Math.max(8, 42-x*.7), vision_powdery: 12+x*.15, vision_rust: 46+x*.55, vision_prediction: 'Rust', esp32_mac:'AA:BB:CC:11:22:33', esp32cam_mac:'DD:EE:FF:44:55:66', wifi_channel:6, uptime_seconds:x*300 });
  }
}
