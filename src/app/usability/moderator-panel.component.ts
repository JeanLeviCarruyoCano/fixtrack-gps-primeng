import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { UsabilityTrackingService } from './usability-tracking.service';
import { ERROR_TYPE_LABEL, ErrorSeverity, ErrorType } from './usability.models';

@Component({
  selector: 'app-moderator-panel',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    SharedModule,
    ButtonModule,
    CardModule,
    DividerModule,
    DropdownModule,
    InputTextModule,
    MessageModule,
    SelectButtonModule,
    TagModule,
  ],
  templateUrl: './moderator-panel.component.html',
  styleUrls: ['./moderator-panel.component.scss'],
})
export class ModeratorPanelComponent implements OnDestroy {
  readonly service = inject(UsabilityTrackingService);

  readonly open = signal(false);
  readonly selectedTaskId = signal(this.service.tasks[0].id);
  readonly errorType = signal<ErrorType>('otro');
  readonly severity = signal<ErrorSeverity>('critico');
  readonly note = signal('');
  readonly feedback = signal('');
  readonly feedbackOk = signal(true);
  private readonly now = signal(Date.now());
  private readonly timer = setInterval(() => this.now.set(Date.now()), 500);
  private feedbackTimer?: ReturnType<typeof setTimeout>;

  readonly taskOptions = this.service.tasks.map((t) => ({ value: t.id, label: `${t.id} · ${t.title}` }));

  readonly severities: { value: ErrorSeverity; label: string }[] = [
    { value: 'critico', label: 'Crítico' },
    { value: 'menor', label: 'Menor' },
  ];

  readonly errorTypes = (Object.keys(ERROR_TYPE_LABEL) as ErrorType[]).map((value) => ({
    value,
    label: ERROR_TYPE_LABEL[value],
  }));

  readonly displayTask = computed(
    () => this.service.activeTask() ?? this.service.tasks.find((t) => t.id === this.selectedTaskId()) ?? null,
  );

  readonly elapsed = computed(() => {
    const attempt = this.service.activeAttempt();
    if (!attempt) return '0:00';
    const seconds = Math.max(0, Math.floor((this.now() - attempt.startedAt) / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  });

  start(): void {
    this.service.startTask(this.selectedTaskId());
  }

  logError(): void {
    const ok = this.service.logError(this.errorType(), this.severity(), this.note());
    this.note.set('');
    this.feedbackOk.set(ok);
    this.feedback.set(ok ? 'Error registrado.' : 'Inicia una tarea antes de registrar errores.');
    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => this.feedback.set(''), 2500);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    clearTimeout(this.feedbackTimer);
  }
}
