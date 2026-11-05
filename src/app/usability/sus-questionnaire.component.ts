import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { UsabilityTrackingService } from './usability-tracking.service';

export const SUS_QUESTIONS: string[] = [
  'Creo que me gustaría usar este sistema con frecuencia.',
  'Encontré el sistema innecesariamente complejo.',
  'Pensé que el sistema era fácil de usar.',
  'Creo que necesitaría el apoyo de un técnico para poder usar este sistema.',
  'Encontré que las diversas funciones de este sistema estaban bien integradas.',
  'Pensé que había demasiada inconsistencia en este sistema.',
  'Imagino que la mayoría de las personas aprenderían a usar este sistema muy rápidamente.',
  'Encontré el sistema muy incómodo de usar.',
  'Me sentí muy seguro/a usando el sistema.',
  'Necesité aprender muchas cosas antes de poder empezar a usar el sistema.',
];

@Component({
  selector: 'app-sus-questionnaire',
  standalone: true,
  imports: [FormsModule, SharedModule, ButtonModule, DialogModule, MessageModule, ProgressBarModule, RadioButtonModule],
  template: `
    <p-dialog
      header="Cuestionario de usabilidad (SUS)"
      [visible]="service.susOpen()"
      (visibleChange)="onVisibleChange($event)"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [closable]="false"
      [closeOnEscape]="false"
      appendTo="body"
      styleClass="app-dialog app-pn usability-ignore"
      [style]="{ width: 'min(720px, 96vw)' }"
      [contentStyle]="{ 'max-height': '70vh' }"
    >
      <p class="intro">
        Indique qué tan de acuerdo está con cada afirmación: 1 = totalmente en desacuerdo, 5 = totalmente de acuerdo.
      </p>
      <p-progressBar [value]="answered() * 10" [showValue]="false" ariaLabel="Progreso del cuestionario"></p-progressBar>

      @for (q of questions; let i = $index; track i) {
        <div class="question" role="radiogroup" [attr.aria-labelledby]="'sus-q-' + i">
          <p class="q-text" [id]="'sus-q-' + i">{{ i + 1 }}. {{ q }}</p>
          <div class="scale">
            @for (v of scale; track v) {
              <div class="point">
                <p-radioButton
                  [name]="'sus-' + i"
                  [inputId]="'sus-' + i + '-' + v"
                  [value]="v"
                  [ngModel]="answers()[i]"
                  (ngModelChange)="set(i, $event)"
                ></p-radioButton>
                <label [for]="'sus-' + i + '-' + v">{{ v }}</label>
              </div>
            }
          </div>
        </div>
      }

      <ng-template pTemplate="footer">
        @if (!complete()) {
          <p-message severity="info" [text]="'Responda las 10 preguntas para continuar (' + answered() + '/10).'"></p-message>
        }
        <p-button label="Cerrar sin guardar" severity="secondary" [outlined]="true" (onClick)="service.closeSus()"></p-button>
        <p-button label="Enviar respuestas" icon="pi pi-check" [disabled]="!complete()" (onClick)="submit()"></p-button>
      </ng-template>
    </p-dialog>
  `,
  styleUrls: ['./sus-questionnaire.component.scss'],
})
export class SusQuestionnaireComponent {
  readonly service = inject(UsabilityTrackingService);
  readonly questions = SUS_QUESTIONS;
  readonly scale = [1, 2, 3, 4, 5];
  readonly answers = signal<(number | null)[]>(Array<number | null>(10).fill(null));
  readonly answered = computed(() => this.answers().filter((a) => a !== null).length);
  readonly complete = computed(() => this.answered() === 10);

  set(index: number, value: number): void {
    this.answers.update((a) => a.map((v, i) => (i === index ? value : v)));
  }

  onVisibleChange(visible: boolean): void {
    if (!visible) this.service.closeSus();
  }

  submit(): void {
    if (!this.complete()) return;
    this.service.submitSus(this.answers() as number[]);
    this.answers.set(Array<number | null>(10).fill(null));
  }
}
