import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmationService, SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { UsabilityTrackingService } from './usability-tracking.service';
import { USABILITY_TARGETS } from './usability-tasks.config';
import { computeSummary, hasData, rawToCsv, summaryToMarkdown } from './usability-metrics';
import { ERROR_TYPE_LABEL, ErrorType } from './usability.models';

type TagSeverity = 'success' | 'danger' | 'secondary';

@Component({
  selector: 'app-usability-results',
  standalone: true,
  imports: [RouterLink, SharedModule, ButtonModule, CardModule, ConfirmDialogModule, MessageModule, TableModule, TagModule],
  providers: [ConfirmationService],
  templateUrl: './usability-results.component.html',
  styleUrls: ['./usability-results.component.scss'],
})
export class UsabilityResultsComponent {
  private readonly service = inject(UsabilityTrackingService);
  private readonly confirmation = inject(ConfirmationService);

  readonly errorLabel = ERROR_TYPE_LABEL;
  readonly targets = USABILITY_TARGETS;

  readonly summary = computed(() => computeSummary(this.service.data(), this.service.tasks, USABILITY_TARGETS));
  readonly hasData = computed(() => hasData(this.service.data()));

  readonly metricRows = computed(() => {
    const s = this.summary();
    const rate = (r: { value: number | null; count: number; total: number }) =>
      `${this.fmt(r.value)} % (${r.count}/${r.total})`;
    return [
      { name: 'Tasa de éxito de tareas', result: rate(s.successRate), target: `≥ ${this.targets.successRate} %`, meets: s.successRate.meets },
      { name: 'Tiempo en tarea (mediana)', result: 'Ver tabla de tiempos', target: '≤ 45 s / ≤ 90 s según tarea', meets: s.timesMeet },
      { name: 'Intentos con error crítico', result: rate(s.errorRate), target: `< ${this.targets.errorRate} %`, meets: s.errorRate.meets },
      { name: 'Éxito de la primera interacción', result: rate(s.firstInteractionRate), target: `≥ ${this.targets.firstInteractionRate} %`, meets: s.firstInteractionRate.meets },
      { name: 'SUS promedio', result: this.fmt(s.susAverage), target: `> ${this.targets.sus}`, meets: s.susMeets },
    ];
  });

  fmt(value: number | null, digits = 1): string {
    return value === null ? '—' : value.toFixed(digits);
  }

  typeLabel(type: ErrorType): string {
    return ERROR_TYPE_LABEL[type];
  }

  severityOf(meets: boolean | null): TagSeverity {
    return meets === null ? 'secondary' : meets ? 'success' : 'danger';
  }

  iconOf(meets: boolean | null): string {
    return meets === null ? 'pi pi-minus' : meets ? 'pi pi-check' : 'pi pi-times';
  }

  verdict(meets: boolean | null): string {
    return meets === null ? 'Sin datos' : meets ? 'Cumple' : 'No cumple';
  }

  exportJson(): void {
    this.download('usabilidad-datos.json', JSON.stringify(this.service.data(), null, 2), 'application/json');
  }

  exportCsv(): void {
    this.download('usabilidad-datos.csv', '\ufeff' + rawToCsv(this.service.data()), 'text/csv;charset=utf-8');
  }

  exportMarkdown(): void {
    this.download(
      'usabilidad-resumen.md',
      summaryToMarkdown(this.summary(), this.service.tasks),
      'text/markdown;charset=utf-8',
    );
  }

  clear(): void {
    this.confirmation.confirm({
      header: 'Borrar datos',
      message: 'Se eliminarán todos los datos de la prueba guardados en este navegador. ¿Continuar?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Borrar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: () => this.service.clearAll(),
    });
  }

  private download(filename: string, content: string, type: string): void {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
