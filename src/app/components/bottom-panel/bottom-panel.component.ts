import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { GpsService } from '../../services/gps.service';
import { MapCommandService } from '../../services/map-command.service';
import { PanelView } from '../../models/gps.model';
import { GpsSelectorComponent } from '../gps-selector/gps-selector.component';

interface PanelButton {
  view: PanelView;
  label: string;
  icon: string;
  hint: string;
}

@Component({
  selector: 'app-bottom-panel',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, RippleModule, GpsSelectorComponent],
  template: `
    <div class="panel" #panel>
      <app-gps-selector></app-gps-selector>

      <nav class="actions" aria-label="Secciones del vehículo">
        <button
          *ngFor="let b of buttons"
          type="button"
          pButton
          pRipple
          class="action-btn p-button-rounded"
          [class.active]="isActive(b.view)"
          [class.disabled]="gps.selectedDevice() === null"
          [attr.aria-current]="isActive(b.view) ? 'page' : null"
          [attr.aria-disabled]="gps.selectedDevice() === null"
          [attr.data-track]="'nav-' + b.view"
          (click)="onSelect(b.view)"
          [pTooltip]="gps.selectedDevice() === null ? 'Selecciona un GPS primero' : b.hint"
          tooltipPosition="top"
        >
          <i class="pi" [class]="b.icon"></i>
          <span class="action-label">{{ b.label }}</span>
        </button>
      </nav>
    </div>
  `,
  styles: [
    `
      .panel {
        position: absolute;
        bottom: 18px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        width: min(690px, calc(100vw - 28px));
        border: 1px solid var(--border);
        background: var(--surface-glass);
        backdrop-filter: blur(14px);
        border-radius: 17px;
        padding: 12px;
        box-shadow: 0 12px 34px var(--shadow-color);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .actions {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 4px;
      }

      :host ::ng-deep .action-btn.p-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        min-height: 62px;
        padding: 8px 4px;
        border-radius: 11px;
        background: transparent;
        border: none;
        color: var(--text-primary);
        font-size: 0.6875rem;
        font-weight: 600;
        box-shadow: none;
        height: auto;
        position: relative;
        transition: background 0.15s ease;
      }
      :host ::ng-deep .action-btn.p-button:not(.disabled):hover {
        background: var(--surface-hover);
      }
      :host ::ng-deep .action-btn.p-button.active {
        background: var(--accent-soft);
        color: var(--accent);
        font-weight: 700;
      }
      :host ::ng-deep .action-btn.p-button.active::after {
        content: '';
        position: absolute;
        left: 22%;
        right: 22%;
        bottom: 3px;
        height: 3px;
        border-radius: 3px;
        background: var(--accent);
      }
      :host ::ng-deep .action-btn.p-button.active .pi {
        color: var(--accent);
      }
      :host ::ng-deep .action-btn.p-button.disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      :host ::ng-deep .action-btn.p-button .pi {
        font-size: 20px;
      }
      .action-label {
        letter-spacing: 0.2px;
      }

      @media (max-width: 540px) {
        .panel {
          bottom: 9px;
          width: calc(100vw - 20px);
          padding: 8px;
          border-radius: 15px;
        }
        .actions {
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 2px;
        }
        :host ::ng-deep .action-btn.p-button {
          min-width: 0;
          min-height: 57px;
          padding: 7px 1px;
        }
        .action-label {
          font-size: 0.5625rem;
          letter-spacing: -0.2px;
        }
        :host ::ng-deep .action-btn.p-button .pi {
          font-size: 16px;
        }
      }
    `,
  ],
})
export class BottomPanelComponent implements AfterViewInit, OnDestroy {
  readonly gps = inject(GpsService);
  private readonly cmd = inject(MapCommandService);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private observer?: ResizeObserver;
  private readonly onResize = () => this.measure();

  buttons: PanelButton[] = [
    { view: 'control', label: 'Control', icon: 'pi pi-cog', hint: 'Control remoto' },
    { view: 'posicion', label: 'Posición', icon: 'pi pi-map-marker', hint: 'Ubicación actual' },
    { view: 'trayecto', label: 'Trayecto', icon: 'pi pi-directions', hint: 'Ruta recorrida' },
    { view: 'dashcam', label: 'Dashcam', icon: 'pi pi-video', hint: 'Cámara a bordo' },
    { view: 'informe', label: 'Informe', icon: 'pi pi-chart-bar', hint: 'Reportes' },
    { view: 'geocerca', label: 'Geocerca', icon: 'pi pi-shield', hint: 'Cercas virtuales' },
  ];

  onSelect(view: PanelView): void {
    this.gps.setView(view);
  }

  isActive(view: PanelView): boolean {
    return this.gps.selectedDevice() !== null && this.gps.activeView() === view;
  }

  ngAfterViewInit(): void {
    this.measure();
    this.observer = new ResizeObserver(this.onResize);
    this.observer.observe(this.panel().nativeElement);
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    window.removeEventListener('resize', this.onResize);
  }

  private measure(): void {
    const rect = this.panel().nativeElement.getBoundingClientRect();
    this.cmd.setNavHeight(window.innerHeight - rect.top);
  }
}
