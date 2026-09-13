import {
  DashboardState,
  TelemetryRecord,
  WateringEvent,
  DeviceCommand,
  DeviceControlResponse,
} from '../types/dashboard';

export async function getDashboardState(): Promise<DashboardState> {
  const response = await fetch('/api/state');
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard state: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function createWateringEvent(note: string = 'Recorded from dashboard'): Promise<WateringEvent> {
  const response = await fetch('/api/watering', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ note }),
  });
  if (!response.ok) {
    throw new Error(`Failed to record watering event: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function sendDemoData(payload: Partial<TelemetryRecord>): Promise<TelemetryRecord> {
  const response = await fetch('/api/demo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to send demo data: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function sendDeviceCommand(command: DeviceCommand): Promise<DeviceControlResponse> {
  const response = await fetch('/api/control', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ command }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || `Failed to send command ${command}`);
  }
  return data;
}
