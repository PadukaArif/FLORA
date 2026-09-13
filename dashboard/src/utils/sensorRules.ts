import { TelemetryRecord, ThresholdConfig } from '../types/dashboard';

export interface MetricInterpretation {
  valueFormatted: string;
  unit: string;
  status: 'OPTIMAL' | 'MODERATE' | 'ALERT' | 'ATTENTION';
  statusLabel: string;
  statusColor: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
  explanation: string;
  reference: string;
}

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  soilDry: 30,
  soilVeryDry: 20,
  soilWet: 80,
  tempHigh: 35,
  humidityLow: 45,
  humidityHigh: 80,
  consecutive: 3,
};

export function interpretTemperature(
  temp: number | undefined | null,
  cfg: Partial<ThresholdConfig> = DEFAULT_THRESHOLDS
): MetricInterpretation {
  if (temp === undefined || temp === null || isNaN(Number(temp))) {
    return {
      valueFormatted: '—',
      unit: '°C',
      status: 'ATTENTION',
      statusLabel: 'No Data',
      statusColor: { bg: '#F2F6F4', text: '#5C736B', border: '#E2EAE6', dot: '#5C736B' },
      explanation: 'Menunggu penerimaan data sensor suhu DHT22.',
      reference: 'Ref: 22.0 – 28.0 °C',
    };
  }

  const t = Number(temp);
  const tempHigh = cfg.tempHigh ?? 35;

  if (t < 18) {
    return {
      valueFormatted: t.toFixed(1),
      unit: '°C',
      status: 'MODERATE',
      statusLabel: 'Sejuk / Rendah',
      statusColor: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', dot: '#D97706' },
      explanation: 'Suhu lingkungan di bawah kisaran optimal. Laju metabolisme tanaman melambat.',
      reference: 'Ref target: 22.0 – 28.0 °C',
    };
  }

  if (t <= 28) {
    return {
      valueFormatted: t.toFixed(1),
      unit: '°C',
      status: 'OPTIMAL',
      statusLabel: 'Optimal',
      statusColor: { bg: '#E8F5E9', text: '#1B5E20', border: '#C8E6C9', dot: '#2E7D32' },
      explanation: 'Suhu berada pada rentang ideal untuk fotosintesis dan pertumbuhan tanaman.',
      reference: 'Ref target: 22.0 – 28.0 °C',
    };
  }

  if (t < tempHigh) {
    return {
      valueFormatted: t.toFixed(1),
      unit: '°C',
      status: 'MODERATE',
      statusLabel: 'Hangat',
      statusColor: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', dot: '#D97706' },
      explanation: 'Suhu berada pada kondisi hangat. Pantau ketersediaan air perakaran tanaman.',
      reference: `Ref: 22–28 °C (Batas: ${tempHigh} °C)`,
    };
  }

  return {
    valueFormatted: t.toFixed(1),
    unit: '°C',
    status: 'ALERT',
    statusLabel: 'Stres Panas',
    statusColor: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA', dot: '#DC2626' },
    explanation: 'Suhu melebihi ambang batas aman. Risiko stres panas dan penguapan berlebih.',
    reference: `Batas konfigurasi: > ${tempHigh} °C`,
  };
}

export function interpretHumidity(
  hum: number | undefined | null,
  cfg: Partial<ThresholdConfig> = DEFAULT_THRESHOLDS
): MetricInterpretation {
  if (hum === undefined || hum === null || isNaN(Number(hum))) {
    return {
      valueFormatted: '—',
      unit: '%',
      status: 'ATTENTION',
      statusLabel: 'No Data',
      statusColor: { bg: '#F2F6F4', text: '#5C736B', border: '#E2EAE6', dot: '#5C736B' },
      explanation: 'Menunggu pembacaan kelembapan udara DHT22.',
      reference: 'Ref: 55 – 75 %',
    };
  }

  const h = Number(hum);
  const humLow = cfg.humidityLow ?? 45;
  const humHigh = cfg.humidityHigh ?? 80;

  if (h < humLow) {
    return {
      valueFormatted: h.toFixed(1),
      unit: '%',
      status: 'MODERATE',
      statusLabel: 'Udara Kering',
      statusColor: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', dot: '#D97706' },
      explanation: 'Kelembapan udara rendah mempercepat transpirasi daun secara berlebih.',
      reference: `Batas bawah konfigurasi: < ${humLow} %`,
    };
  }

  if (h <= 75) {
    return {
      valueFormatted: h.toFixed(1),
      unit: '%',
      status: 'OPTIMAL',
      statusLabel: 'Optimal',
      statusColor: { bg: '#E8F5E9', text: '#1B5E20', border: '#C8E6C9', dot: '#2E7D32' },
      explanation: 'Kelembapan udara seimbang mendukung transpirasi stabil tanaman.',
      reference: 'Ref target: 55 – 75 %',
    };
  }

  if (h <= humHigh) {
    return {
      valueFormatted: h.toFixed(1),
      unit: '%',
      status: 'MODERATE',
      statusLabel: 'Meningkat',
      statusColor: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', dot: '#D97706' },
      explanation: 'Kelembapan udara meningkat. Pastikan sirkulasi udara di sekitar kanopi daun tetap lancar.',
      reference: `Batas atas konfigurasi: ${humHigh} %`,
    };
  }

  return {
    valueFormatted: h.toFixed(1),
    unit: '%',
    status: 'ALERT',
    statusLabel: 'Sangat Lembap',
    statusColor: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA', dot: '#DC2626' },
    explanation: 'Kelembapan udara jenuh berpotensi memicu kondensasi air pada permukaan daun.',
    reference: `Batas konfigurasi: > ${humHigh} %`,
  };
}

export function interpretSoil(
  soil: number | undefined | null,
  cfg: Partial<ThresholdConfig> = DEFAULT_THRESHOLDS
): MetricInterpretation {
  if (soil === undefined || soil === null || isNaN(Number(soil))) {
    return {
      valueFormatted: '—',
      unit: '%',
      status: 'ATTENTION',
      statusLabel: 'No Data',
      statusColor: { bg: '#F2F6F4', text: '#5C736B', border: '#E2EAE6', dot: '#5C736B' },
      explanation: 'Menunggu pembacaan probe kelembapan tanah.',
      reference: 'Ref: 50 – 70 %',
    };
  }

  const s = Number(soil);
  const soilDry = cfg.soilDry ?? 30;
  const soilVeryDry = cfg.soilVeryDry ?? 20;
  const soilWet = cfg.soilWet ?? 80;

  if (s < soilVeryDry) {
    return {
      valueFormatted: s.toFixed(1),
      unit: '%',
      status: 'ALERT',
      statusLabel: 'Kritis Kering',
      statusColor: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA', dot: '#DC2626' },
      explanation: 'Kadar air tanah kritis. Segera lakukan pengecekan dan penyiraman.',
      reference: `Batas kritis: < ${soilVeryDry} %`,
    };
  }

  if (s < soilDry) {
    return {
      valueFormatted: s.toFixed(1),
      unit: '%',
      status: 'MODERATE',
      statusLabel: 'Mulai Kering',
      statusColor: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', dot: '#D97706' },
      explanation: 'Kadar air tanah mulai menurun. Pantau media tanam sebelum penyiraman.',
      reference: `Ambang kering: < ${soilDry} %`,
    };
  }

  if (s <= soilWet) {
    return {
      valueFormatted: s.toFixed(1),
      unit: '%',
      status: 'OPTIMAL',
      statusLabel: 'Cukup / Baik',
      statusColor: { bg: '#E8F5E9', text: '#1B5E20', border: '#C8E6C9', dot: '#2E7D32' },
      explanation: 'Kadar air zona perakaran mencukupi kebutuhan hidrasi tanaman.',
      reference: `Rentang optimal: ${soilDry} – ${soilWet} %`,
    };
  }

  return {
    valueFormatted: s.toFixed(1),
    unit: '%',
    status: 'MODERATE',
    statusLabel: 'Sangat Basah',
    statusColor: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', dot: '#D97706' },
    explanation: 'Media tanam sangat basah / jenuh air. Tunda penyiraman berikutnya.',
    reference: `Ambang basah: > ${soilWet} %`,
  };
}

export function generateFloraInsight(latest: TelemetryRecord | null): {
  headline: string;
  summary: string;
  actionGuidance: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
} {
  if (!latest) {
    return {
      headline: 'Menunggu Telemetri Sistem',
      summary: 'Data sensor dan analisis AI akan ditampilkan setelah telemetri ESP32 diterima.',
      actionGuidance: 'Pastikan ESP32 dan ESP32-CAM terhubung ke broker MQTT.',
      priority: 'LOW',
    };
  }

  const risk = (latest.sensor_risk || 'LOW').toUpperCase();
  const vision = (latest.vision_prediction || 'HEALTHY').toUpperCase();
  const soil = Number(latest.soil_moisture || 50);

  if (risk === 'HIGH' || vision === 'RUST') {
    return {
      headline: vision === 'RUST' ? 'Indikasi Pola Visual Rust Terdeteksi' : 'Risiko Lingkungan Tinggi',
      summary: `Model AI mendeteksi risiko lingkungan ${risk} dengan indikasi visual ${vision}. Perlu inspeksi fisik daun dan evaluasi mikroklimat.`,
      actionGuidance: 'Periksa fisik daun yang terindikasi dan pastikan drainase serta kelembapan lingkungan terkontrol.',
      priority: 'HIGH',
    };
  }

  if (risk === 'MODERATE' || vision === 'POWDERY' || soil < 30) {
    return {
      headline: vision === 'POWDERY' ? 'Indikasi Pola Powdery Terdeteksi' : 'Kondisi Memerlukan Pemantauan',
      summary: `Kondisi mikroklimat berada pada level ${risk} dengan klasifikasi visual ${vision} dan kelembapan tanah ${soil.toFixed(0)}%.`,
      actionGuidance: 'Lakukan pemantauan rutin dan periksa kelembapan media tanam serta sirkulasi udara.',
      priority: 'MEDIUM',
    };
  }

  return {
    headline: 'Kondisi Tanaman Relatif Stabil',
    summary: 'Parameter lingkungan dan klasifikasi visual daun saat ini berada dalam rentang normal dan terpantau baik.',
    actionGuidance: 'Lanjutkan pemantauan rutin berkala tanpa perlu intervensi khusus.',
    priority: 'LOW',
  };
}
