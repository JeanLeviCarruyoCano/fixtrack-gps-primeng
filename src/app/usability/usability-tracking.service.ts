import { Injectable, computed, inject, signal } from '@angular/core';
import { GpsService } from '../services/gps.service';
import { susScore } from './sus-score';
import { USABILITY_TASKS } from './usability-tasks.config';
import {
  ErrorSeverity,
  ErrorType,
  TaskAttempt,
  TaskOutcome,
  UsabilityData,
  UsabilityTask,
  emptyData,
} from './usability.models';

const STORAGE_KEY = 'fixtrack.usabilidad.datos.v1';
const MODE_KEY = 'fixtrack.usabilidad.activo';

@Injectable({ providedIn: 'root' })
export class UsabilityTrackingService {
  private readonly gps = inject(GpsService);

  readonly tasks: UsabilityTask[] = USABILITY_TASKS;

  private readonly _enabled = signal(false);
  private readonly _data = signal<UsabilityData>(emptyData());
  private readonly _susOpen = signal(false);

  readonly enabled = this._enabled.asReadonly();
  readonly data = this._data.asReadonly();
  readonly susOpen = this._susOpen.asReadonly();

  readonly participantId = computed(() => this._data().currentParticipantId);

  readonly activeAttempt = computed<TaskAttempt | null>(
    () => this._data().attempts.find((a) => a.endedAt === undefined) ?? null,
  );

  readonly activeTask = computed<UsabilityTask | null>(() => {
    const attempt = this.activeAttempt();
    return attempt ? (this.tasks.find((t) => t.id === attempt.taskId) ?? null) : null;
  });

  readonly allTasksDone = computed(() => {
    const id = this.participantId();
    if (!id) return false;
    const finished = this._data().attempts.filter((a) => a.participantId === id && a.endedAt !== undefined);
    return this.tasks.every((t) => finished.some((a) => a.taskId === t.id));
  });

  readonly susDone = computed(() => {
    const id = this.participantId();
    return id !== null && this._data().sus.some((s) => s.participantId === id);
  });

  constructor() {
    this._data.set(this.load());
    this._enabled.set(this.resolveInitialMode());

    document.addEventListener('click', (event) => this.onClick(event), true);
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'u') {
        event.preventDefault();
        this.setEnabled(!this._enabled());
      }
    });
  }

  setEnabled(enabled: boolean): void {
    this._enabled.set(enabled);
    this.safeStorage(() => {
      if (enabled) localStorage.setItem(MODE_KEY, '1');
      else localStorage.removeItem(MODE_KEY);
    });
    if (!enabled) this._susOpen.set(false);
  }

  newParticipant(): string {
    const id = `P${String(this._data().participants.length + 1).padStart(2, '0')}`;
    this.update((d) => ({
      ...d,
      participants: [...d.participants, id],
      currentParticipantId: id,
    }));
    return id;
  }

  startTask(taskId: string): boolean {
    if (!this._enabled() || this.activeAttempt()) return false;
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return false;
    const participantId = this.participantId() ?? this.newParticipant();
    const previous = this._data().attempts.filter(
      (a) => a.participantId === participantId && a.taskId === taskId,
    ).length;

    this.gps.select(null);
    this.gps.setView('control');

    const attempt: TaskAttempt = {
      id: this.newId(),
      participantId,
      taskId,
      attempt: previous + 1,
      startedAt: Date.now(),
    };
    this.update((d) => ({ ...d, attempts: [...d.attempts, attempt] }));
    return true;
  }

  finishTask(outcome: TaskOutcome): void {
    const attempt = this.activeAttempt();
    if (!this._enabled() || !attempt) return;
    const task = this.tasks.find((t) => t.id === attempt.taskId);
    const conditionMet = task?.check
      ? task.check({ selectedId: this.gps.selectedId(), activeView: this.gps.activeView() })
      : undefined;

    this.update((d) => ({
      ...d,
      attempts: d.attempts.map((a) =>
        a.id === attempt.id ? { ...a, endedAt: Date.now(), outcome, conditionMet } : a,
      ),
    }));
    if (this.allTasksDone() && !this.susDone()) this._susOpen.set(true);
  }

  logError(type: ErrorType, severity: ErrorSeverity, note?: string): boolean {
    if (!this._enabled()) return false;
    const participantId = this.participantId();
    const attempt =
      this.activeAttempt() ??
      [...this._data().attempts].reverse().find((a) => a.participantId === participantId);
    if (!attempt) return false;
    this.update((d) => ({
      ...d,
      errors: [
        ...d.errors,
        {
          at: Date.now(),
          participantId: attempt.participantId,
          attemptId: attempt.id,
          taskId: attempt.taskId,
          type,
          severity,
          note: note?.trim() || undefined,
        },
      ],
    }));
    return true;
  }

  openSus(): void {
    if (this._enabled() && this.participantId()) this._susOpen.set(true);
  }

  closeSus(): void {
    this._susOpen.set(false);
  }

  submitSus(answers: number[]): number {
    const participantId = this.participantId();
    if (!participantId) throw new Error('No hay participante activo.');
    const score = susScore(answers);
    this.update((d) => ({
      ...d,
      sus: [
        ...d.sus.filter((s) => s.participantId !== participantId),
        { participantId, at: Date.now(), answers: [...answers], score },
      ],
    }));
    this._susOpen.set(false);
    return score;
  }

  clearAll(): void {
    this._susOpen.set(false);
    this.update(() => emptyData());
  }

  private onClick(event: MouseEvent): void {
    if (!this._enabled()) return;
    const target = event.target;
    if (!(target instanceof Element) || target.closest('[data-usability-ignore], .usability-ignore')) return;
    const participantId = this.participantId();
    if (!participantId) return;

    const tracked = target.closest('[data-track]');
    const trackId =
      tracked?.getAttribute('data-track') ??
      (target.closest('.leaflet-container') ? 'mapa' : `sin-id:${target.tagName.toLowerCase()}`);
    const attempt = this.activeAttempt();
    const at = Date.now();

    this.update((d) => {
      let attempts = d.attempts;
      if (attempt && !attempt.firstInteraction) {
        const task = this.tasks.find((t) => t.id === attempt.taskId);
        const correct = task?.expectedFirstTargets.includes(trackId) ?? false;
        attempts = attempts.map((a) =>
          a.id === attempt.id ? { ...a, firstInteraction: { at, trackId, correct } } : a,
        );
      }
      return {
        ...d,
        attempts,
        clicks: [
          ...d.clicks,
          {
            at,
            participantId,
            attemptId: attempt?.id ?? null,
            taskId: attempt?.taskId ?? null,
            trackId,
            tag: target.tagName.toLowerCase(),
          },
        ],
      };
    });
  }

  private update(fn: (data: UsabilityData) => UsabilityData): void {
    const next = fn(this._data());
    this._data.set(next);
    this.safeStorage(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(next)));
  }

  private load(): UsabilityData {
    let parsed: UsabilityData | null = null;
    this.safeStorage(() => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) parsed = JSON.parse(raw) as UsabilityData;
    });
    const loaded = parsed as UsabilityData | null;
    return loaded && loaded.version === 1 ? { ...emptyData(), ...loaded } : emptyData();
  }

  private resolveInitialMode(): boolean {
    const param = new URLSearchParams(window.location.search).get('usabilidad');
    if (param === '1') {
      this.safeStorage(() => localStorage.setItem(MODE_KEY, '1'));
      return true;
    }
    if (param === '0') {
      this.safeStorage(() => localStorage.removeItem(MODE_KEY));
      return false;
    }
    let active = false;
    this.safeStorage(() => {
      active = localStorage.getItem(MODE_KEY) === '1';
    });
    return active;
  }

  private newId(): string {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }

  private safeStorage(action: () => void): void {
    try {
      action();
    } catch {
      /* almacenamiento no disponible o datos corruptos */
    }
  }
}
