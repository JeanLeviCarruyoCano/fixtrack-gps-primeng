import { MetricTargets, computeSummary, mean, median, percentage, rawToCsv, summaryToMarkdown, susScore } from './usability-metrics';
import { USABILITY_TASKS } from './usability-tasks.config';
import { TaskAttempt, UsabilityData, emptyData } from './usability.models';

const targets: MetricTargets = { successRate: 90, errorRate: 10, firstInteractionRate: 80, sus: 75 };

function attempt(partial: Partial<TaskAttempt> & { id: string; taskId: string; seconds: number }): TaskAttempt {
  const { seconds, ...rest } = partial;
  return {
    participantId: 'P01',
    attempt: 1,
    startedAt: 1_000_000,
    endedAt: 1_000_000 + seconds * 1000,
    outcome: 'sin-ayuda',
    ...rest,
  };
}

function fixture(): UsabilityData {
  return {
    ...emptyData(),
    participants: ['P01'],
    currentParticipantId: 'P01',
    attempts: [
      attempt({ id: 'a1', taskId: 'T1', seconds: 30, conditionMet: true, firstInteraction: { at: 1, trackId: 'selector-vehiculo', correct: true } }),
      attempt({ id: 'a2', taskId: 'T1', seconds: 50, outcome: 'con-ayuda', firstInteraction: { at: 1, trackId: 'mapa', correct: false } }),
      attempt({ id: 'a3', taskId: 'T3', seconds: 100, firstInteraction: { at: 1, trackId: 'nav-trayecto', correct: true } }),
      attempt({ id: 'a4', taskId: 'T3', seconds: 20, outcome: 'abandono' }),
      { id: 'a5', participantId: 'P01', taskId: 'T2', attempt: 1, startedAt: 5 },
    ],
    errors: [
      { at: 2, participantId: 'P01', attemptId: 'a2', taskId: 'T1', type: 'vehiculo-equivocado', severity: 'critico' },
      { at: 3, participantId: 'P01', attemptId: 'a3', taskId: 'T3', type: 'otro', severity: 'menor', note: '=cmd' },
    ],
    sus: [
      { participantId: 'P01', at: 4, answers: [4, 2, 4, 2, 4, 2, 4, 2, 4, 2], score: 75 },
      { participantId: 'P02', at: 5, answers: [5, 1, 5, 1, 5, 1, 5, 1, 5, 1], score: 100 },
    ],
  };
}

describe('usability-metrics', () => {
  describe('median / mean / percentage', () => {
    it('calcula la mediana con cantidad impar y par', () => {
      expect(median([5, 1, 3])).toBe(3);
      expect(median([4, 1, 3, 2])).toBe(2.5);
    });

    it('devuelve null sin datos', () => {
      expect(median([])).toBeNull();
      expect(mean([])).toBeNull();
      expect(percentage(0, 0)).toBeNull();
    });

    it('calcula promedio y porcentaje', () => {
      expect(mean([30, 50])).toBe(40);
      expect(percentage(3, 4)).toBe(75);
    });
  });

  describe('susScore', () => {
    it('todas las respuestas en 3 dan 50', () => {
      expect(susScore(Array(10).fill(3))).toBe(50);
    });

    it('respuestas ideales dan 100 y las peores 0', () => {
      expect(susScore([5, 1, 5, 1, 5, 1, 5, 1, 5, 1])).toBe(100);
      expect(susScore([1, 5, 1, 5, 1, 5, 1, 5, 1, 5])).toBe(0);
    });

    it('[4,2,4,2,...] da 75 (impares 3x5 + pares 3x5 = 30 × 2,5)', () => {
      expect(susScore([4, 2, 4, 2, 4, 2, 4, 2, 4, 2])).toBe(75);
    });

    it('[5,2,4,1,5,1,4,2,5,2] da 87,5 (18 + 17 = 35 × 2,5)', () => {
      expect(susScore([5, 2, 4, 1, 5, 1, 4, 2, 5, 2])).toBe(87.5);
    });

    it('rechaza cantidades o valores inválidos', () => {
      expect(() => susScore([1, 2, 3])).toThrow();
      expect(() => susScore([0, 2, 3, 3, 3, 3, 3, 3, 3, 3])).toThrow();
      expect(() => susScore([6, 2, 3, 3, 3, 3, 3, 3, 3, 3])).toThrow();
    });
  });

  describe('computeSummary', () => {
    const summary = computeSummary(fixture(), USABILITY_TASKS, targets);

    it('ignora intentos sin finalizar', () => {
      expect(summary.finishedAttempts).toBe(4);
    });

    it('tasa de éxito: 2 de 4 = 50 %', () => {
      expect(summary.successRate.value).toBe(50);
      expect(summary.successRate.meets).toBeFalse();
    });

    it('éxito requiere condición no incumplida', () => {
      const data = fixture();
      data.attempts[0] = { ...data.attempts[0], conditionMet: false };
      expect(computeSummary(data, USABILITY_TASKS, targets).successRate.count).toBe(1);
    });

    it('errores críticos: 1 de 4 = 25 % (los menores no cuentan)', () => {
      expect(summary.errorRate.value).toBe(25);
      expect(summary.errorRate.meets).toBeFalse();
    });

    it('primera interacción: 2 de 3 intentos con clic', () => {
      expect(summary.firstInteractionRate.count).toBe(2);
      expect(summary.firstInteractionRate.total).toBe(3);
      expect(summary.firstInteractionRate.value).toBeCloseTo(66.67, 2);
    });

    it('tiempos por tarea excluyen abandonos', () => {
      const t1 = summary.taskTimes.find((t) => t.taskId === 'T1');
      const t3 = summary.taskTimes.find((t) => t.taskId === 'T3');
      expect(t1?.median).toBe(40);
      expect(t1?.mean).toBe(40);
      expect(t1?.meets).toBeTrue();
      expect(t3?.n).toBe(1);
      expect(t3?.median).toBe(100);
      expect(t3?.meets).toBeFalse();
      expect(summary.timesMeet).toBeFalse();
    });

    it('SUS promedio 87,5 cumple la meta > 75', () => {
      expect(summary.susAverage).toBe(87.5);
      expect(summary.susMeets).toBeTrue();
    });

    it('sin datos todo es null', () => {
      const empty = computeSummary(emptyData(), USABILITY_TASKS, targets);
      expect(empty.successRate.value).toBeNull();
      expect(empty.successRate.meets).toBeNull();
      expect(empty.susAverage).toBeNull();
      expect(empty.timesMeet).toBeNull();
    });
  });

  describe('exportación', () => {
    it('CSV incluye cabecera y notas del moderador', () => {
      const csv = rawToCsv(fixture());
      expect(csv.split('\n')[0]).toBe(
        'tipo,participante,tarea,intento,marca_tiempo_iso,ms_desde_inicio_tarea,elemento,detalle,valor',
      );
      expect(csv).toContain('Otro – =cmd');
      expect(csv).toContain('sus,P01');
    });

    it('Markdown resume las métricas', () => {
      const md = summaryToMarkdown(computeSummary(fixture(), USABILITY_TASKS, targets), USABILITY_TASKS);
      expect(md).toContain('50.0 % (2/4)');
      expect(md).toContain('87.5');
    });
  });
});
