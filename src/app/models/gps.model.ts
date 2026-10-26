export interface GpsDevice {
  id: string;
  label: string;
  lat: number;
  lng: number;
  speed: number;       // km/h
  heading: number;     // degrees
  status: 'online' | 'offline' | 'idle';
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
