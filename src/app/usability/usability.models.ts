export type TaskOutcome = 'sin-ayuda' | 'con-ayuda' | 'abandono';
export type ErrorSeverity = 'critico' | 'menor';
export type ErrorType =
  | 'vehiculo-equivocado'
  | 'dato-equivocado'
  | 'filtro-incorrecto'
  | 'confusion-estado'
  | 'accion-repetida'
  | 'otro';

export const OUTCOME_LABEL: Record<TaskOutcome, string> = {
  'sin-ayuda': 'Completó sin ayuda',
  'con-ayuda': 'Completó con ayuda',
  abandono: 'Abandonó',
};

export const ERROR_TYPE_LABEL: Record<ErrorType, string> = {
  'vehiculo-equivocado': 'Vehículo equivocado',
  'dato-equivocado': 'Dato equivocado',
  'filtro-incorrecto': 'Filtro incorrecto',
  'confusion-estado': 'Confusión de estado',
  'accion-repetida': 'Acción repetida sin respuesta clara',
  otro: 'Otro',
};

export const SEVERITY_LABEL: Record<ErrorSeverity, string> = {
  critico: 'Crítico',
  menor: 'Menor',
};

export interface FirstInteraction {
  at: number;
  trackId: string;
  correct: boolean;
}

export interface TaskAttempt {
  id: string;
  participantId: string;
  taskId: string;
  attempt: number;
  startedAt: number;
  endedAt?: number;
  outcome?: TaskOutcome;
  conditionMet?: boolean;
  firstInteraction?: FirstInteraction;
}

export interface ClickRecord {
  at: number;
  participantId: string;
  attemptId: string | null;
  taskId: string | null;
  trackId: string;
  tag: string;
}

export interface ErrorRecord {
  at: number;
  participantId: string;
  attemptId: string;
  taskId: string;
  type: ErrorType;
  severity: ErrorSeverity;
  note?: string;
}

export interface SusRecord {
  participantId: string;
  at: number;
  answers: number[];
  score: number;
}

export interface UsabilityData {
  version: 1;
  participants: string[];
  currentParticipantId: string | null;
  attempts: TaskAttempt[];
  clicks: ClickRecord[];
  errors: ErrorRecord[];
  sus: SusRecord[];
}

export function emptyData(): UsabilityData {
  return {
    version: 1,
    participants: [],
    currentParticipantId: null,
    attempts: [],
    clicks: [],
    errors: [],
    sus: [],
  };
}

export interface TaskContext {
  selectedId: string | null;
  activeView: string;
}

export interface UsabilityTask {
  id: string;
  title: string;
  instruction: string;
  vehicleId: string;
  expectedFirstTargets: string[];
  successDescription: string;
  check?: (ctx: TaskContext) => boolean;
  targetSeconds: number | null;
}
