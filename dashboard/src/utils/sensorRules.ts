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
      statusColor: { bg: '#F4F7F2', text: '#617253', border: '#E4EBE0', dot: '#617253' },
      explanation: 'Menunggu pembacaan sensor suhu DHT22.',
      reference: 'Target: 22.0 – 28.0 °C',
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
      statusColor: { bg: '#FEF7E8', text: '#8A570C', border: '#FDE3B5', dot: '#D97706' },
      explanation: 'Suhu lingkungan di bawah kisaran optimal. Laju metabolisme tanaman melambat.',
      reference: 'Target: 22.0 – 28.0 °C',
    };
  }

  if (t <= 28) {
    return {
      valueFormatted: t.toFixed(1),
      unit: '°C',
      status: 'OPTIMAL',
      statusLabel: 'Optimal',
      statusColor: { bg: '#EAF4E8', text: '#22531A', border: '#C4E1BF', dot: '#367C29' },
      explanation: 'Suhu berada pada rentang ideal untuk fotosintesis dan pertumbuhan daun.',
      reference: 'Target: 22.0 – 28.0 °C',
    };
  }

  if (t < tempHigh) {
    return {
      valueFormatted: t.toFixed(1),
      unit: '°C',
      status: 'MODERATE',
      statusLabel: 'Hangat',
      statusColor: { bg: '#FEF7E8', text: '#8A570C', border: '#FDE3B5', dot: '#D97706' },
      explanation: 'Suhu di atas target normal. Pantau kelembapan tanah agar akar tidak dehidrasi.',
      reference: `Target: 22–28 °C (Batas: ${tempHigh} °C)`,
    };
  }

  return {
    valueFormatted: t.toFixed(1),
    unit: '°C',
    status: 'ALERT',
    statusLabel: 'Stres Panas',
    statusColor: { bg: '#FEEAEA', text: '#961C1C', border: '#FCCECE', dot: '#DC2626' },
    explanation: 'Suhu melebihi ambang batas aman. Risiko penguapan berlebih dan kelayuan daun.',
    reference: `Batas aman: ≤ ${tempHigh} °C`,
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
      statusColor: { bg: '#F4F7F2', text: '#617253', border: '#E4EBE0', dot: '#617253' },
      explanation: 'Menunggu pembacaan kelembapan udara DHT22.',
      reference: 'Target: 55 – 75 %',
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
      statusColor: { bg: '#FEF7E8', text: '#8A570C', border: '#FDE3B5', dot: '#D97706' },
      explanation: 'Udara kering memicu penguapan air daun lebih cepat dari normal.',
      reference: `Batas bawah: ≥ ${humLow} %`,
    };
  }

  if (h <= 75) {
    return {
      valueFormatted: h.toFixed(1),
      unit: '%',
      status: 'OPTIMAL',
      statusLabel: 'Optimal',
      statusColor: { bg: '#EAF4E8', text: '#22531A', border: '#C4E1BF', dot: '#367C29' },
      explanation: 'Kelembapan udara seimbang, mendukung transpirasi stabil tanaman.',
      reference: 'Target: 55 – 75 %',
    };
  }

  if (h <= humHigh) {
    return {
      valueFormatted: h.toFixed(1),
      unit: '%',
      status: 'MODERATE',
      statusLabel: 'Meningkat',
      statusColor: { bg: '#FEF7E8', text: '#8A570C', border: '#FDE3B5', dot: '#D97706' },
      explanation: 'Kelembapan udara meningkat. Jaga sirkulasi udara kanopi tetap lancar.',
      reference: `Batas atas: ≤ ${humHigh} %`,
    };
  }

  return {
    valueFormatted: h.toFixed(1),
    unit: '%',
    status: 'ALERT',
    statusLabel: 'Sangat Lembap',
    statusColor: { bg: '#FEEAEA', text: '#961C1C', border: '#FCCECE', dot: '#DC2626' },
    explanation: 'Udara jenuh berpotensi memicu kondensasi air pada daun dan spora jamur.',
    reference: `Batas aman: ≤ ${humHigh} %`,
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
      statusColor: { bg: '#F4F7F2', text: '#617253', border: '#E4EBE0', dot: '#617253' },
      explanation: 'Menunggu pembacaan sensor kelembapan tanah.',
      reference: 'Target: 30 – 80 %',
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
      statusColor: { bg: '#FEEAEA', text: '#961C1C', border: '#FCCECE', dot: '#DC2626' },
      explanation: 'Kadar air tanah kritis di bawah 20%. Segera lakukan pengecekan dan penyiraman.',
      reference: `Ambang kritis: < ${soilVeryDry} %`,
    };
  }

  if (s < soilDry) {
    return {
      valueFormatted: s.toFixed(1),
      unit: '%',
      status: 'MODERATE',
      statusLabel: 'Mulai Kering',
      statusColor: { bg: '#FEF7E8', text: '#8A570C', border: '#FDE3B5', dot: '#D97706' },
      explanation: 'Kadar air tanah menurun di bawah target ideal. Pertimbangkan penyiraman.',
      reference: `Ambang kering: < ${soilDry} %`,
    };
  }

  if (s <= soilWet) {
    return {
      valueFormatted: s.toFixed(1),
      unit: '%',
      status: 'OPTIMAL',
      statusLabel: 'Lembap / Cukup',
      statusColor: { bg: '#EAF4E8', text: '#22531A', border: '#C4E1BF', dot: '#367C29' },
      explanation: 'Kadar air zona perakaran mencukupi kebutuhan hidrasi tanaman.',
      reference: `Rentang optimal: ${soilDry} – ${soilWet} %`,
    };
  }

  return {
    valueFormatted: s.toFixed(1),
    unit: '%',
    status: 'MODERATE',
    statusLabel: 'Sangat Basah',
    statusColor: { bg: '#FEF7E8', text: '#8A570C', border: '#FDE3B5', dot: '#D97706' },
    explanation: 'Media tanam sangat basah. Tunda penyiraman berikutnya untuk mencegah busuk akar.',
    reference: `Ambang basah: > ${soilWet} %`,
  };
}

export interface PlantPillars {
  environment: {
    status: 'Optimal' | 'Warm' | 'Cool' | 'Heat Stress' | 'Unknown';
    detail: string;
    isNormal: boolean;
  };
  soil: {
    status: 'Optimal' | 'Needs Water' | 'Critically Dry' | 'Saturated' | 'Unknown';
    detail: string;
    isNormal: boolean;
  };
  aiRisk: {
    status: 'Low' | 'Moderate' | 'High' | 'Unknown';
    detail: string;
    confidence: number | null;
  };
  aiVision: {
    status: 'Healthy' | 'Powdery' | 'Rust' | 'Standby' | 'Unknown';
    detail: string;
    dominantProb: number | null;
  };
  overallAssessment: string;
  hasEnoughData: boolean;
}

export function evaluatePlantPillars(latest: TelemetryRecord | null): PlantPillars {
  if (!latest) {
    return {
      environment: { status: 'Unknown', detail: 'Awaiting sensor stream', isNormal: false },
      soil: { status: 'Unknown', detail: 'Awaiting sensor stream', isNormal: false },
      aiRisk: { status: 'Unknown', detail: 'Awaiting inference', confidence: null },
      aiVision: { status: 'Unknown', detail: 'Awaiting optical data', dominantProb: null },
      overallAssessment: 'Not enough data for an overall assessment.',
      hasEnoughData: false,
    };
  }

  const hasTemp = latest.temperature !== undefined && latest.temperature !== null && !isNaN(Number(latest.temperature));
  const hasHum = latest.humidity !== undefined && latest.humidity !== null && !isNaN(Number(latest.humidity));
  const hasSoil = latest.soil_moisture !== undefined && latest.soil_moisture !== null && !isNaN(Number(latest.soil_moisture));

  if (!hasTemp || !hasHum || !hasSoil) {
    return {
      environment: { status: 'Unknown', detail: 'Incomplete telemetry', isNormal: false },
      soil: { status: 'Unknown', detail: 'Incomplete telemetry', isNormal: false },
      aiRisk: { status: 'Unknown', detail: 'Awaiting full sensor data', confidence: null },
      aiVision: { status: 'Unknown', detail: 'Awaiting optical stream', dominantProb: null },
      overallAssessment: 'Not enough data for an overall assessment.',
      hasEnoughData: false,
    };
  }

  const t = Number(latest.temperature);
  const h = Number(latest.humidity);
  const s = Number(latest.soil_moisture);

  // 1. Environment Pillar
  let envStatus: 'Optimal' | 'Warm' | 'Cool' | 'Heat Stress' = 'Optimal';
  let envDetail = `${t.toFixed(1)}°C · ${h.toFixed(0)}% RH`;
  let envNormal = true;
  if (t >= 35) {
    envStatus = 'Heat Stress';
    envNormal = false;
  } else if (t > 28) {
    envStatus = 'Warm';
    envNormal = false;
  } else if (t < 18) {
    envStatus = 'Cool';
    envNormal = false;
  }

  // 2. Soil Pillar
  let soilStatus: 'Optimal' | 'Needs Water' | 'Critically Dry' | 'Saturated' = 'Optimal';
  let soilDetail = `${s.toFixed(1)}% moisture`;
  let soilNormal = true;
  if (s < 20) {
    soilStatus = 'Critically Dry';
    soilNormal = false;
  } else if (s < 30) {
    soilStatus = 'Needs Water';
    soilNormal = false;
  } else if (s > 80) {
    soilStatus = 'Saturated';
    soilNormal = false;
  }

  // 3. AI Risk Pillar
  const riskStr = (latest.sensor_risk || 'Moderate').toLowerCase();
  let riskStatus: 'Low' | 'Moderate' | 'High' = 'Moderate';
  if (riskStr.includes('low')) riskStatus = 'Low';
  else if (riskStr.includes('high')) riskStatus = 'High';
  const conf = latest.sensor_confidence !== undefined ? Number(latest.sensor_confidence) : null;
  const riskDetail = conf ? `${riskStatus} Risk (${conf.toFixed(1)}%)` : `${riskStatus} Risk`;

  // 4. AI Vision Pillar
  const isVisionConnected = Boolean(latest.vision_connected);
  let visionStatus: 'Healthy' | 'Powdery' | 'Rust' | 'Standby' = 'Standby';
  let dominantProb: number | null = null;
  if (isVisionConnected) {
    const rawPred = (latest.vision_prediction || 'Healthy').toLowerCase();
    if (rawPred.includes('powdery')) visionStatus = 'Powdery';
    else if (rawPred.includes('rust')) visionStatus = 'Rust';
    else visionStatus = 'Healthy';

    dominantProb = Math.max(
      Number(latest.vision_healthy || 0),
      Number(latest.vision_powdery || 0),
      Number(latest.vision_rust || 0)
    );
  }
  const visionDetail = isVisionConnected
    ? `${visionStatus}${dominantProb ? ` (${dominantProb.toFixed(0)}%)` : ''}`
    : 'Camera Standby';

  // Overall Botanical Synthesis (Honest, factual synthesis without fake scores)
  let overall = '';
  const issues: string[] = [];
  if (soilStatus === 'Critically Dry') issues.push('critically dry soil (<20%) requiring immediate watering');
  else if (soilStatus === 'Needs Water') issues.push('low soil moisture (<30%) that may need watering');
  else if (soilStatus === 'Saturated') issues.push('saturated soil moisture (>80%)');

  if (envStatus === 'Heat Stress') issues.push('elevated temperature causing heat stress (≥35°C)');
  else if (envStatus === 'Warm') issues.push('warm ambient temperature (>28°C)');
  else if (envStatus === 'Cool') issues.push('cool ambient temperature (<18°C)');

  if (visionStatus === 'Rust') issues.push('visual indication matching Rust fungal pattern');
  else if (visionStatus === 'Powdery') issues.push('visual indication matching Powdery Mildew pattern');

  if (issues.length === 0) {
    overall = 'Plant microclimate, soil moisture, and leaf condition are currently stable within optimal target ranges.';
  } else {
    overall = `Environmental conditions need attention, mainly due to ${issues.join(' and ')}.`;
  }

  return {
    environment: { status: envStatus, detail: envDetail, isNormal: envNormal },
    soil: { status: soilStatus, detail: soilDetail, isNormal: soilNormal },
    aiRisk: { status: riskStatus, detail: riskDetail, confidence: conf },
    aiVision: { status: visionStatus, detail: visionDetail, dominantProb },
    overallAssessment: overall,
    hasEnoughData: true,
  };
}

export interface SystemAlertInfo {
  severity: 'CRITICAL' | 'WARNING' | 'NORMAL' | 'AWAITING';
  title: string;
  description: string;
  actionText?: string;
  actionTarget?: string;
}

export function evaluateSystemAlert(
  latest: TelemetryRecord | null,
  mqttStatus?: string
): SystemAlertInfo {
  if (mqttStatus && mqttStatus !== 'CONNECTED') {
    return {
      severity: 'CRITICAL',
      title: 'MQTT Broker Disconnected',
      description: 'Hubungan ke broker MQTT terputus. Data telemetri realtime dijeda hingga tersambung kembali.',
      actionText: 'Periksa Koneksi',
      actionTarget: 'devices',
    };
  }

  if (!latest) {
    return {
      severity: 'AWAITING',
      title: 'Menunggu Telemetri Sistem',
      description: 'Menunggu transmisi data pertama dari ESP32 untuk evaluasi kondisi tanaman.',
    };
  }

  const s = Number(latest.soil_moisture);
  const t = Number(latest.temperature);
  const h = Number(latest.humidity);
  const risk = (latest.sensor_risk || '').toLowerCase();
  const vision = (latest.vision_prediction || '').toLowerCase();

  // CRITICAL Conditions
  if (s < 20) {
    return {
      severity: 'CRITICAL',
      title: 'Kadar Air Tanah Kritis Rendah',
      description: `Kelembapan tanah saat ini ${s.toFixed(1)}% (di bawah batas kritis 20%). Media tanam butuh hidrasi segera.`,
      actionText: 'Lihat Rekomendasi Siram',
      actionTarget: 'treatment',
    };
  }

  if (t >= 35) {
    return {
      severity: 'CRITICAL',
      title: 'Peringatan Stres Panas Lingkungan',
      description: `Suhu terdeteksi ${t.toFixed(1)}°C (melebihi batas aman 35°C). Penguapan berlebih dapat memicu layu.`,
      actionText: 'Periksa Sensor',
      actionTarget: 'monitoring',
    };
  }

  if (risk.includes('high') && (vision.includes('rust') || vision.includes('powdery'))) {
    return {
      severity: 'CRITICAL',
      title: 'Risiko Mikroklimat Tinggi & Indikasi Penyakit Daun',
      description: `Model mendeteksi risiko mikroklimat tinggi disertai indikasi visual pola ${vision.toUpperCase()}.`,
      actionText: 'Inspeksi Analisis AI',
      actionTarget: 'analysis',
    };
  }

  // WARNING Conditions
  if (s < 30) {
    return {
      severity: 'WARNING',
      title: 'Kadar Air Tanah Mulai Menurun',
      description: `Kelembapan tanah ${s.toFixed(1)}% (di bawah target 30%). Pertimbangkan pengecekan media tanam dan penyiraman.`,
      actionText: 'Buka Rekomendasi',
      actionTarget: 'treatment',
    };
  }

  if (vision.includes('rust')) {
    return {
      severity: 'WARNING',
      title: 'Indikasi Pola Visual Karat (Rust) Ditemukan',
      description: 'Kamera mendeteksi pola visual menyerupai karat daun. Lakukan inspeksi fisik kanopi.',
      actionText: 'Periksa AI Vision',
      actionTarget: 'analysis',
    };
  }

  if (vision.includes('powdery')) {
    return {
      severity: 'WARNING',
      title: 'Indikasi Pola Visual Jamur Tepung (Powdery) Ditemukan',
      description: 'Kamera mendeteksi pola bercak keputihan pada daun. Evaluasi ventilasi udara sekitar tanaman.',
      actionText: 'Periksa AI Vision',
      actionTarget: 'analysis',
    };
  }

  if (t > 28) {
    return {
      severity: 'WARNING',
      title: 'Suhu Lingkungan Hangat di Atas Target',
      description: `Suhu berada pada ${t.toFixed(1)}°C (target optimal: 22–28°C). Pantau kecukupan air perakaran.`,
      actionText: 'Pantau Sensor',
      actionTarget: 'monitoring',
    };
  }

  if (h < 45 || h > 80) {
    return {
      severity: 'WARNING',
      title: h < 45 ? 'Kelembapan Udara Rendah' : 'Kelembapan Udara Sangat Tinggi',
      description: `Kelembapan udara terukur ${h.toFixed(1)}% di luar rentang ideal 45–75%.`,
      actionText: 'Pantau Sensor',
      actionTarget: 'monitoring',
    };
  }

  // NORMAL Condition
  return {
    severity: 'NORMAL',
    title: 'Kondisi Tanaman & Mikroklimat Stabil',
    description: 'Semua parameter sensor tanah, suhu, kelembapan, dan analisis visual berada dalam kisaran normal.',
  };
}

export function explainEnvironmentalRisk(latest: TelemetryRecord | null): {
  reasons: string[];
  actions: string[];
} {
  if (!latest) {
    return {
      reasons: ['Menunggu telemetri sensor dari ESP32.'],
      actions: ['Pastikan ESP32 terhubung dan mempublikasikan data sensor.'],
    };
  }

  const reasons: string[] = [];
  const actions: string[] = [];

  const t = Number(latest.temperature);
  const h = Number(latest.humidity);
  const s = Number(latest.soil_moisture);

  // Soil analysis
  if (s < 20) {
    reasons.push(`Kadar air tanah (${s.toFixed(1)}%) kritis di bawah 20%, menyebabkan tanaman mengalami defisit air parah.`);
    actions.push('Lakukan penyiraman manual secukupnya untuk mengembalikan kelembapan zona perakaran.');
  } else if (s < 30) {
    reasons.push(`Kadar air tanah (${s.toFixed(1)}%) berada di bawah target ideal 30%.`);
    actions.push('Periksa kelembapan media tanam dan siram jika tanah terasa kering saat disentuh.');
  } else if (s > 80) {
    reasons.push(`Kadar air tanah (${s.toFixed(1)}%) sangat tinggi, berpotensi membatasi aerasi perakaran.`);
    actions.push('Tunda penyiraman berikutnya dan pastikan lubang drainase pot tidak tersumbat.');
  } else {
    reasons.push(`Kadar air tanah (${s.toFixed(1)}%) berada dalam rentang ideal (30–80%).`);
  }

  // Temperature analysis
  if (t >= 35) {
    reasons.push(`Suhu udara (${t.toFixed(1)}°C) melampaui batas aman 35°C (kondisi stres panas).`);
    actions.push('Pindahkan tanaman ke area lebih teduh atau tingkatkan sirkulasi udara di sekitar pot.');
  } else if (t > 28) {
    reasons.push(`Suhu udara (${t.toFixed(1)}°C) berada di atas rentang target (22–28°C).`);
    actions.push('Pantau ketersediaan air agar laju transpirasi daun tetap terkompensasi.');
  } else if (t < 18) {
    reasons.push(`Suhu udara (${t.toFixed(1)}°C) di bawah rentang optimal tanaman.`);
  } else {
    reasons.push(`Suhu udara (${t.toFixed(1)}°C) berada dalam kisaran optimal fotosintesis.`);
  }

  // Humidity analysis
  if (h > 80) {
    reasons.push(`Kelembapan udara (${h.toFixed(1)}%) jenuh, memicu risiko tinggi perkecambahan spora patogen jamur.`);
    actions.push('Pastikan sirkulasi udara di sekitar tanaman lancar dan hindari menyiram daun.');
  } else if (h < 45) {
    reasons.push(`Kelembapan udara (${h.toFixed(1)}%) rendah, meningkatkan penguapan stomata daun.`);
  } else {
    reasons.push(`Kelembapan udara (${h.toFixed(1)}%) stabil mendukung transpirasi alami.`);
  }

  if (actions.length === 0) {
    actions.push('Lanjutkan pemantauan rutin berkala; seluruh parameter mikroklimat stabil.');
  }

  return { reasons, actions };
}

export function explainVisionClassification(latest: TelemetryRecord | null): {
  interpretation: string;
  why: string;
  whatToDo: string;
} {
  if (!latest || !latest.vision_connected) {
    return {
      interpretation: 'Menunggu transmisi inferensi optik dari kamera ESP32-CAM.',
      why: 'Node kamera sedang dalam mode siaga atau belum ada frame yang diklasifikasikan via ESP-NOW.',
      whatToDo: 'Pastikan modul ESP32-CAM aktif dan berada pada channel nirkabel yang sama.',
    };
  }

  const pred = (latest.vision_prediction || 'Healthy').toLowerCase();

  if (pred.includes('rust')) {
    return {
      interpretation: 'Terdeteksi indikasi pola visual penyakit Karat Daun (Rust).',
      why: 'Pola visual kanopi daun memiliki bercak warna kecokelatan yang cocok dengan kelas model Karat (Rust).',
      whatToDo: 'Inspeksi fisik sisi bawah daun yang dicurigai. Jaga daun tetap kering dan pisahkan tanaman bila bintik meluas.',
    };
  }

  if (pred.includes('powdery')) {
    return {
      interpretation: 'Terdeteksi indikasi pola visual Jamur Tepung (Powdery Mildew).',
      why: 'Pola visual daun memiliki area keputihan menyerupai lapisan tepung yang cocok dengan kelas model Powdery.',
      whatToDo: 'Periksa daun bergejala, pangkas bila parah, dan tingkatkan sirkulasi udara di sekitar kanopi.',
    };
  }

  return {
    interpretation: 'Tidak ditemukan indikasi visual penyakit pada kanopi daun.',
    why: 'Pola tekstur dan warna daun terdeteksi seragam dan cocok dengan kelas daun sehat (Healthy).',
    whatToDo: 'Lanjutkan perawatan dan pemantauan berkala tanpa intervensi kimiawi.',
  };
}
