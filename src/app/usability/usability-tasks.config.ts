import { UsabilityTask } from './usability.models';

export const USABILITY_TASKS: UsabilityTask[] = [
  {
    id: 'T1',
    title: 'Encontrar vehículo y revisar su estado',
    instruction:
      'Seleccione el vehículo mex111 y dígame si está en movimiento, detenido o sin señal.',
    vehicleId: 'mex111',
    expectedFirstTargets: ['selector-vehiculo', 'marker-mex111'],
    successDescription:
      'Selecciona mex111 y responde correctamente su estado (en movimiento).',
    check: (ctx) => ctx.selectedId === 'mex111',
    targetSeconds: 45,
  },
  {
    id: 'T2',
    title: 'Consultar última actualización o velocidad',
    instruction:
      'Seleccione el vehículo mx205 y dígame su velocidad actual y cuándo fue su última actualización.',
    vehicleId: 'mx205',
    expectedFirstTargets: ['selector-vehiculo', 'marker-mx205'],
    successDescription: 'Selecciona mx205 e indica velocidad o última actualización correctas.',
    check: (ctx) => ctx.selectedId === 'mx205',
    targetSeconds: 45,
  },
  {
    id: 'T3',
    title: 'Abrir el recorrido (Trayecto)',
    instruction: 'Abra el trayecto del vehículo mx041.',
    vehicleId: 'mx041',
    expectedFirstTargets: ['selector-vehiculo', 'marker-mx041', 'nav-trayecto'],
    successDescription: 'Deja seleccionado mx041 con la sección Trayecto visible.',
    check: (ctx) => ctx.selectedId === 'mx041' && ctx.activeView === 'trayecto',
    targetSeconds: 90,
  },
  {
    id: 'T4',
    title: 'Consultar una alerta o Geocerca/Informe',
    instruction:
      'Con el vehículo mx072, indíqueme cuál fue la última alerta de geocerca que tuvo.',
    vehicleId: 'mx072',
    expectedFirstTargets: ['selector-vehiculo', 'marker-mx072', 'nav-geocerca'],
    successDescription: 'Abre la sección Geocerca de mx072 e indica la última alerta.',
    check: (ctx) => ctx.selectedId === 'mx072' && ctx.activeView === 'geocerca',
    targetSeconds: null,
  },
];

export const USABILITY_TARGETS = {
  successRate: 90,
  errorRate: 10,
  firstInteractionRate: 80,
  sus: 75,
};
