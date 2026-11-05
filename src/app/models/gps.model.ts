export type GpsStatus = 'online' | 'offline' | 'idle';

export interface GpsDevice {
  id: string;
  label: string;
  lat: number;
  lng: number;
  speed: number;       // km/h
  heading: number;     // degrees
  status: GpsStatus;
  lastUpdate: Date;
  vehicle: string;
  driver?: string;
}

export const GPS_DEVICES: GpsDevice[] = [
  {
    id: 'mx041',
    label: 'mx041',
    lat: -1.0438,
    lng: -80.4559,
    speed: 0,
    heading: 0,
    status: 'idle',
    lastUpdate: new Date(),
    vehicle: 'Toyota Hilux 2022',
    driver: 'Carlos Méndez'
  },
  {
    id: 'mex111',
    label: 'mex111',
    lat: -1.0387,
    lng: -80.4486,
    speed: 42,
    heading: 135,
    status: 'online',
    lastUpdate: new Date(),
    vehicle: 'Ford F-150 2021',
    driver: 'Ana Rojas'
  },
  {
    id: 'mx072',
    label: 'mx072',
    lat: -1.0513,
    lng: -80.4638,
    speed: 0,
    heading: 0,
    status: 'offline',
    lastUpdate: new Date(Date.now() - 3600 * 1000),
    vehicle: 'Chevrolet Silverado 2020',
    driver: 'Luis Torres'
  },
  {
    id: 'mx205',
    label: 'mx205',
    lat: -1.0345,
    lng: -80.4602,
    speed: 78,
    heading: 270,
    status: 'online',
    lastUpdate: new Date(),
    vehicle: 'Nissan NP300 2023',
    driver: 'María López'
  }
];

export type PanelView =
  | 'control'
  | 'posicion'
  | 'trayecto'
  | 'dashcam'
  | 'informe'
  | 'geocerca';

export type AlertSeverity = 'critica' | 'aviso';

export interface GpsAlert {
  id: string;
  deviceId: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  status: GpsStatus;
  since: Date;
}

export const SPEED_LIMIT_KMH = 70;

export function buildAlerts(devices: GpsDevice[]): GpsAlert[] {
  const alerts: GpsAlert[] = [];
  for (const d of devices) {
    if (d.status === 'offline') {
      alerts.push({
        id: `${d.id}-sin-senal`,
        deviceId: d.id,
        severity: 'critica',
        title: 'Sin señal',
        detail: `${d.label} (${d.vehicle}) dejó de reportar su posición.`,
        status: d.status,
        since: d.lastUpdate,
      });
    } else if (d.status === 'idle') {
      alerts.push({
        id: `${d.id}-detenido`,
        deviceId: d.id,
        severity: 'aviso',
        title: 'Vehículo detenido',
        detail: `${d.label} (${d.vehicle}) permanece detenido.`,
        status: d.status,
        since: d.lastUpdate,
      });
    }
    if (d.speed > SPEED_LIMIT_KMH) {
      alerts.push({
        id: `${d.id}-velocidad`,
        deviceId: d.id,
        severity: 'aviso',
        title: 'Exceso de velocidad',
        detail: `${d.label} circula a ${d.speed} km/h (límite ${SPEED_LIMIT_KMH} km/h).`,
        status: d.status,
        since: d.lastUpdate,
      });
    }
  }
  return alerts.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'critica' ? -1 : 1));
}
