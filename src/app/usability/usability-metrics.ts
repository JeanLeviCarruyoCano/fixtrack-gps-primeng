import { susScore } from './sus-score';
import {
  ERROR_TYPE_LABEL,
  ErrorSeverity,
  ErrorType,
  OUTCOME_LABEL,
  SEVERITY_LABEL,
  TaskAttempt,
  UsabilityData,
  UsabilityTask,
} from './usability.models';

export interface MetricTargets {
  successRate: number;
  errorRate: number;
  firstInteractionRate: number;
  sus: number;
}

export interface RateMetric {
  value: number | null;
  count: number;
  total: number;
  target: number;
  meets: boolean | null;
}

export interface TaskTimeStat {
  taskId: string;
  title: string;
  n: number;
  median: number | null;
  mean: number | null;
  targetSeconds: number | null;
  meets: boolean | null;
}

export interface SusParticipantScore {
  participantId: string;
  score: number;
}

export interface MetricsSummary {
  finishedAttempts: number;
  participants: number;
  successRate: RateMetric;
  errorRate: RateMetric;
  firstInteractionRate: RateMetric;
  taskTimes: TaskTimeStat[];
  timesMeet: boolean | null;
  errorsByType: { type: ErrorType; critico: number; menor: number }[];
  susScores: SusParticipantScore[];
  susAverage: number | null;
  susTarget: number;
  susMeets: boolean | null;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function percentage(count: number, total: number): number | null {
  return total === 0 ? null : (count / total) * 100;
}

export { susScore };

export function isSuccessful(attempt: TaskAttempt): boolean {
  return attempt.outcome === 'sin-ayuda' && attempt.conditionMet !== false;
}

export function isFinished(attempt: TaskAttempt): boolean {
  return attempt.endedAt !== undefined && attempt.outcome !== undefined;
}

export function attemptSeconds(attempt: TaskAttempt): number | null {
  return attempt.endedAt === undefined ? null : (attempt.endedAt - attempt.startedAt) / 1000;
}

function rateMetric(count: number, total: number, target: number, higherIsBetter: boolean): RateMetric {
  const value = percentage(count, total);
  const meets = value === null ? null : higherIsBetter ? value >= target : value < target;
  return { value, count, total, target, meets };
}

export function computeSummary(
  data: UsabilityData,
  tasks: UsabilityTask[],
  targets: MetricTargets,
): MetricsSummary {
  const finished = data.attempts.filter(isFinished);

  const successes = finished.filter(isSuccessful).length;

  const criticalAttempts = new Set(
    data.errors.filter((e) => e.severity === 'critico').map((e) => e.attemptId),
  );
  const withCritical = finished.filter((a) => criticalAttempts.has(a.id)).length;

  const withFirst = finished.filter((a) => a.firstInteraction !== undefined);
  const firstCorrect = withFirst.filter((a) => a.firstInteraction?.correct).length;

  const taskTimes: TaskTimeStat[] = tasks.map((task) => {
    const seconds = finished
      .filter((a) => a.taskId === task.id && a.outcome !== 'abandono')
      .map((a) => attemptSeconds(a))
      .filter((s): s is number => s !== null);
    const med = median(seconds);
    return {
      taskId: task.id,
      title: task.title,
      n: seconds.length,
      median: med,
      mean: mean(seconds),
      targetSeconds: task.targetSeconds,
      meets: med === null || task.targetSeconds === null ? null : med <= task.targetSeconds,
    };
  });
  const evaluated = taskTimes.filter((t) => t.meets !== null);
  const timesMeet = evaluated.length === 0 ? null : evaluated.every((t) => t.meets);

  const errorTypes = Object.keys(ERROR_TYPE_LABEL) as ErrorType[];
  const errorsByType = errorTypes.map((type) => ({
    type,
    critico: data.errors.filter((e) => e.type === type && e.severity === 'critico').length,
    menor: data.errors.filter((e) => e.type === type && e.severity === 'menor').length,
  }));

  const susScores = data.sus.map((s) => ({ participantId: s.participantId, score: s.score }));
  const susAverage = mean(susScores.map((s) => s.score));

  return {
    finishedAttempts: finished.length,
    participants: new Set(finished.map((a) => a.participantId)).size,
    successRate: rateMetric(successes, finished.length, targets.successRate, true),
    errorRate: rateMetric(withCritical, finished.length, targets.errorRate, false),
    firstInteractionRate: rateMetric(firstCorrect, withFirst.length, targets.firstInteractionRate, true),
    taskTimes,
    timesMeet,
    errorsByType,
    susScores,
    susAverage,
    susTarget: targets.sus,
    susMeets: susAverage === null ? null : susAverage > targets.sus,
  };
}

export function hasData(data: UsabilityData): boolean {
  return data.attempts.some(isFinished) || data.sus.length > 0;
}

function fmt(value: number | null, digits = 1, suffix = ''): string {
  return value === null ? 'sin datos' : `${value.toFixed(digits)}${suffix}`;
}

function verdict(meets: boolean | null): string {
  return meets === null ? '—' : meets ? 'Cumple' : 'No cumple';
}

export function summaryToMarkdown(summary: MetricsSummary, tasks: UsabilityTask[]): string {
  const rate = (m: RateMetric) => `${fmt(m.value, 1, ' %')} (${m.count}/${m.total})`;
  const lines: string[] = [
    '# Resumen de métricas de usabilidad',
    '',
    `Intentos finalizados: ${summary.finishedAttempts} · Participantes: ${summary.participants}`,
    '',
    '## Métricas frente a metas',
    '',
    '| Métrica | Resultado | Meta | Estado |',
    '|---|---|---|---|',
    `| Tasa de éxito de tareas | ${rate(summary.successRate)} | ≥ ${summary.successRate.target} % | ${verdict(summary.successRate.meets)} |`,
    `| Tiempo en tarea (mediana por tarea) | ver tabla de tiempos | ≤ metas por tarea | ${verdict(summary.timesMeet)} |`,
    `| Intentos con error crítico | ${rate(summary.errorRate)} | < ${summary.errorRate.target} % | ${verdict(summary.errorRate.meets)} |`,
    `| Éxito de la primera interacción | ${rate(summary.firstInteractionRate)} | ≥ ${summary.firstInteractionRate.target} % | ${verdict(summary.firstInteractionRate.meets)} |`,
    `| SUS promedio | ${fmt(summary.susAverage)} | > ${summary.susTarget} | ${verdict(summary.susMeets)} |`,
    '',
    '## Tiempos por tarea (segundos, sin contar abandonos)',
    '',
    '| Tarea | n | Mediana | Promedio | Meta | Estado |',
    '|---|---|---|---|---|---|',
    ...summary.taskTimes.map(
      (t) =>
        `| ${t.taskId} · ${t.title} | ${t.n} | ${fmt(t.median)} | ${fmt(t.mean)} | ${
          t.targetSeconds === null ? '—' : `≤ ${t.targetSeconds} s`
        } | ${verdict(t.meets)} |`,
    ),
    '',
    '## Errores por tipo y gravedad',
    '',
    '| Tipo | Crítico | Menor |',
    '|---|---|---|',
    ...summary.errorsByType.map((e) => `| ${ERROR_TYPE_LABEL[e.type]} | ${e.critico} | ${e.menor} |`),
    '',
    '## SUS por participante',
    '',
    '| Participante | Puntuación |',
    '|---|---|',
    ...summary.susScores.map((s) => `| ${s.participantId} | ${fmt(s.score)} |`),
    `| **Promedio** | **${fmt(summary.susAverage)}** |`,
    '',
    `Tareas definidas: ${tasks.map((t) => t.id).join(', ')}`,
    '',
  ];
  return lines.join('\n');
}

function csvCell(value: string | number | undefined): string {
  let text = value === undefined ? '' : String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function rawToCsv(data: UsabilityData): string {
  const header = [
    'tipo',
    'participante',
    'tarea',
    'intento',
    'marca_tiempo_iso',
    'ms_desde_inicio_tarea',
    'elemento',
    'detalle',
    'valor',
  ];
  const rows: (string | number | undefined)[][] = [];
  const attemptById = new Map(data.attempts.map((a) => [a.id, a]));
  const since = (attemptId: string | null, at: number): number | undefined => {
    const attempt = attemptId ? attemptById.get(attemptId) : undefined;
    return attempt ? at - attempt.startedAt : undefined;
  };

  for (const a of data.attempts) {
    rows.push(['tarea_inicio', a.participantId, a.taskId, a.attempt, new Date(a.startedAt).toISOString(), 0]);
    if (a.endedAt !== undefined) {
      rows.push([
        'tarea_fin',
        a.participantId,
        a.taskId,
        a.attempt,
        new Date(a.endedAt).toISOString(),
        a.endedAt - a.startedAt,
        '',
        a.outcome ? OUTCOME_LABEL[a.outcome] : '',
        a.conditionMet === undefined ? '' : a.conditionMet ? 'condicion_cumplida' : 'condicion_no_cumplida',
      ]);
    }
  }
  for (const c of data.clicks) {
    const attempt = c.attemptId ? attemptById.get(c.attemptId) : undefined;
    const isFirst = attempt?.firstInteraction?.at === c.at && attempt.firstInteraction.trackId === c.trackId;
    rows.push([
      'clic',
      c.participantId,
      c.taskId ?? '',
      attempt?.attempt,
      new Date(c.at).toISOString(),
      since(c.attemptId, c.at),
      c.trackId,
      c.tag,
      isFirst ? (attempt?.firstInteraction?.correct ? 'primera_interaccion_correcta' : 'primera_interaccion_incorrecta') : '',
    ]);
  }
  for (const e of data.errors) {
    const attempt = attemptById.get(e.attemptId);
    rows.push([
      'error',
      e.participantId,
      e.taskId,
      attempt?.attempt,
      new Date(e.at).toISOString(),
      since(e.attemptId, e.at),
      '',
      `${ERROR_TYPE_LABEL[e.type]}${e.note ? ` – ${e.note}` : ''}`,
      SEVERITY_LABEL[e.severity as ErrorSeverity],
    ]);
  }
  for (const s of data.sus) {
    rows.push(['sus', s.participantId, '', '', new Date(s.at).toISOString(), '', '', s.answers.join(' '), s.score]);
  }

  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}
