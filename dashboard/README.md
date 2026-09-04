# FLORA Dashboard

**Field & Leaf Observation Robotic Assistant**

Dashboard ini menerima MQTT TLS dari `grenvis/sensor/data`, menyimpan history lokal, menghitung decision support, smart watering, daily summary, trend, dan menyiarkan update ke browser melalui WebSocket.

## Menjalankan

```powershell
cd dashboard
Copy-Item .env.example .env
npm install
npm start
```

Buka `http://localhost:3000`. Isi konfigurasi MQTT di `.env` jika ingin menerima data perangkat. `DEMO_MODE=true` membuat data contoh saat history masih kosong; dashboard tetap dapat digunakan tanpa broker MQTT. Ubah ke `false` setelah ESP32 aktif.

Threshold pada `.env` wajib dikalibrasi sesuai spesies, media tanam, dan sensor. Sistem hanya memberikan rekomendasi; tidak melakukan diagnosis penyakit atau penyiraman otomatis.
