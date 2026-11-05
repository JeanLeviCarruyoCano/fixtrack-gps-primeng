import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GpsStatus } from '../models/gps.model';

export const STATUS_LABEL: Record<GpsStatus, string> = {
  online: 'En movimiento',
  idle: 'Detenido',
  offline: 'Sin señal',
};

const STATUS_PATH: Record<GpsStatus, string> = {
  online: '<path d="M6 4.5v15l13-7.5z" fill="currentColor"/>',
  idle: '<rect x="5.5" y="5.5" width="13" height="13" rx="1.5" fill="currentColor"/>',
  offline:
    '<path d="M12 3 22 20H2z" fill="currentColor"/><path d="M12 9v5" style="stroke:var(--surface)" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.3" style="fill:var(--surface)"/>',
};

export function statusIconSvg(status: GpsStatus, size = 14): string {
  return `<svg class="status-icon status-${status}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${STATUS_PATH[status]}</svg>`;
}

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="'status-' + status" [class.compact]="iconOnly">
      <svg class="icon" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <ng-container [ngSwitch]="status">
          <path *ngSwitchCase="'online'" d="M6 4.5v15l13-7.5z" fill="currentColor" />
          <rect *ngSwitchCase="'idle'" x="5.5" y="5.5" width="13" height="13" rx="1.5" fill="currentColor" />
          <g *ngSwitchDefault>
            <path d="M12 3 22 20H2z" fill="currentColor" />
            <path d="M12 9v5" style="stroke: var(--surface)" stroke-width="2.2" stroke-linecap="round" />
            <circle cx="12" cy="17" r="1.3" style="fill: var(--surface)" />
          </g>
        </ng-container>
      </svg>
      <span class="text" [class.sr-only]="iconOnly">{{ label }}</span>
    </span>
  `,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 2px 8px 2px 6px;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        line-height: 1.5;
        white-space: nowrap;
      }
      .badge.compact {
        padding: 0;
        background: transparent !important;
      }
      .icon {
        display: inline-flex;
      }
      .status-online {
        color: var(--status-online);
        background: var(--status-online-bg);
      }
      .status-idle {
        color: var(--status-idle);
        background: var(--status-idle-bg);
      }
      .status-offline {
        color: var(--status-offline);
        background: var(--status-offline-bg);
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }
    `,
  ],
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: GpsStatus;
  @Input() iconOnly = false;

  get label(): string {
    return STATUS_LABEL[this.status];
  }
}
