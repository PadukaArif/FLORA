# FLORA Smart Plant Monitoring System

FLORA adalah prototype pemantauan tanaman yang menggabungkan ESP32, ESP32-CAM, sensor lingkungan, AI, ESP-NOW, MQTT, dan dashboard web.

## Struktur project

- `dashboard/` — backend Node.js, MQTT subscriber, REST API, WebSocket, dan antarmuka monitoring.
- `firmware/esp32_main/` — pembacaan sensor, environmental ML, penerima ESP-NOW, dan publisher MQTT.
- `firmware/esp32_cam_test/` — test sender ESP-NOW untuk data klasifikasi visual simulasi.
- `.md` — spesifikasi lengkap, arsitektur, tahapan implementasi, serta daftar fitur yang belum aktif.

## Menjalankan dashboard

```powershell
cd dashboard
Copy-Item .env.example .env
npm install
npm start
```

Buka `http://localhost:3000`. Isi kredensial broker pada `dashboard/.env` untuk memakai MQTT, atau biarkan `DEMO_MODE=true` untuk menjalankan dashboard dengan data contoh.

## Status saat ini

Dashboard, API, WebSocket, penyimpanan history lokal, decision support, smart watering recommendation, ringkasan harian, dan tren sudah tersedia. Integrasi AI Vision asli, kamera/foto, soil sensor fisik, database production, notifikasi eksternal, penyiraman otomatis, autentikasi, export laporan, serta deployment production belum aktif.

Daftar status yang lebih lengkap tersedia pada bagian **50. Status Implementasi dan Fitur yang Belum Aktif** di file [`.md`](.md).

## Keamanan

Salin file konfigurasi contoh menjadi file konfigurasi lokal. File `.env`, `config.h`, data history, dan model lokal tidak diikutkan ke Git. Jangan memasukkan kredensial asli ke file `*.example`.

## Catatan

Hasil AI merupakan indikasi pendukung dan bukan diagnosis penyakit tanaman yang pasti. Threshold sensor harus dikalibrasi sesuai spesies, media tanam, dan perangkat fisik.
