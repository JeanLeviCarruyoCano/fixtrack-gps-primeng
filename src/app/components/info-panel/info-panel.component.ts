import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { GpsService } from '../../services/gps.service';
import { PanelView } from '../../models/gps.model';

@Component({
  selector: 'app-info-panel',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, TabViewModule],
  template: `
    <div class="info-panel" *ngIf="gps.selectedDevice() as dev">
      <div class="header">
        <div class="title-row">
          <span
            class="status-dot"
            [class.online]="dev.status === 'online'"
            [class.idle]="dev.status === 'idle'"
            [class.offline]="dev.status === 'offline'"
          ></span>
          <h2>{{ dev.label }}</h2>
          <button
            pButton
            type="button"
            icon="pi pi-times"
            class="p-button-text p-button-rounded close-btn"
            (click)="gps.select(null)"
            aria-label="Cerrar"
          ></button>
        </div>
        <div class="subtitle">{{ dev.vehicle }}</div>
      </div>

      <p-tabView [activeIndex]="activeIndex()" (onChange)="onTabChange($event)" styleClass="info-tabs">
        <p-tabPanel>
          <ng-template pTemplate="header">
            <span class="tab-header"><i class="pi pi-cog"></i> Control</span>
          </ng-template>
          <div class="view">
            <div class="stat-grid">
              <div class="stat">
                <span class="stat-label">Velocidad</span>
                <span class="stat-value">{{ dev.speed }} <small>km/h</small></span>
              </div>
              <div class="stat">
                <span class="stat-label">Rumbo</span>
                <span class="stat-value">{{ dev.heading }}°</span>
              </div>
              <div class="stat">
                <span class="stat-label">Estado</span>
                <p-tag
                  [value]="statusText(dev.status)"
                  [severity]="dev.status === 'online' ? 'success' : dev.status === 'idle' ? 'warning' : 'danger'"
                ></p-tag>
              </div>
              <div class="stat">
                <span class="stat-label">Última actualización</span>
                <span class="stat-value small">{{ dev.lastUpdate | date: 'short' }}</span>
              </div>
            </div>
            <div class="control-actions">
              <button pButton type="button" class="p-button-outlined w-full" icon="pi pi-lock" label="Bloquear motor"></button>
              <button pButton type="button" class="p-button-outlined w-full" icon="pi pi-volume-up" label="Activar bocina"></button>
              <button pButton type="button" class="p-button-outlined p-button-danger w-full" icon="pi pi-exclamation-triangle" label="Botón de pánico"></button>
            </div>
          </div>
        </p-tabPanel>

        <p-tabPanel>
          <ng-template pTemplate="header">
            <span class="tab-header"><i class="pi pi-map-marker"></i> Posición</span>
          </ng-template>
          <div class="view">
            <div class="info-row">
              <span>Latitud</span>
              <strong>{{ dev.lat | number: '1.4-4' }}</strong>
            </div>
            <div class="info-row">
              <span>Longitud</span>
              <strong>{{ dev.lng | number: '1.4-4' }}</strong>
            </div>
            <div class="info-row">
              <span>Conductor</span>
              <strong>{{ dev.driver }}</strong>
            </div>
            <div class="info-row">
              <span>Vehículo</span>
              <strong>{{ dev.vehicle }}</strong>
            </div>
            <div class="info-row">
              <span>Última señal</span>
              <strong>{{ dev.lastUpdate | date: 'medium' }}</strong>
            </div>
          </div>
        </p-tabPanel>

        <p-tabPanel>
          <ng-template pTemplate="header">
            <span class="tab-header"><i class="pi pi-directions"></i> Trayecto</span>
          </ng-template>
          <div class="view">
            <p class="muted">Trayecto de las últimas 24 horas</p>
            <div class="trip-summary">
              <div class="trip-stat">
                <span>Distancia</span>
                <strong>128.4 km</strong>
              </div>
              <div class="trip-stat">
                <span>Duración</span>
                <strong>2h 14m</strong>
              </div>
              <div class="trip-stat">
                <span>Vel. máx</span>
                <strong>92 km/h</strong>
              </div>
              <div class="trip-stat">
                <span>Paradas</span>
                <strong>3</strong>
              </div>
            </div>
          </div>
        </p-tabPanel>

        <p-tabPanel>
          <ng-template pTemplate="header">
            <span class="tab-header"><i class="pi pi-video"></i> Dashcam</span>
          </ng-template>
          <div class="view">
            <div class="dashcam-placeholder">
              <i class="pi pi-video"></i>
              <p>Sin transmisión en vivo</p>
              <small>Último clip: hoy 09:42</small>
            </div>
          </div>
        </p-tabPanel>

        <p-tabPanel>
          <ng-template pTemplate="header">
            <span class="tab-header"><i class="pi pi-chart-bar"></i> Informe</span>
          </ng-template>
          <div class="view">
            <p class="muted">Informe semanal de actividad</p>
            <div class="chart">
              <div class="bar" *ngFor="let b of bars" [style.height.%]="b"></div>
            </div>
            <ul class="report-list">
              <li><span>Lun</span><strong>34 km</strong></li>
              <li><span>Mar</span><strong>52 km</strong></li>
              <li><span>Mié</span><strong>28 km</strong></li>
              <li><span>Jue</span><strong>41 km</strong></li>
              <li><span>Vie</span><strong>67 km</strong></li>
            </ul>
          </div>
        </p-tabPanel>

        <p-tabPanel>
          <ng-template pTemplate="header">
            <span class="tab-header"><i class="pi pi-shield"></i> Geocerca</span>
          </ng-template>
          <div class="view">
            <p class="muted">Geocercas asignadas a este dispositivo</p>
            <ul class="geo-list">
              <li>
                <span class="geo-dot"></span>
                <div>
                  <strong>Oficina central</strong>
                  <small>Radio: 500 m · Activa</small>
                </div>
              </li>
              <li>
                <span class="geo-dot warn"></span>
                <div>
                  <strong>Zona de carga</strong>
                  <small>Radio: 200 m · Última alerta: hoy 08:15</small>
                </div>
              </li>
            </ul>
            <button pButton type="button" class="p-button-outlined w-full" icon="pi pi-plus" label="Crear nueva geocerca"></button>
          </div>
        </p-tabPanel>
      </p-tabView>
    </div>
  `,
  styles: [
    `
      .info-panel {
        position: absolute;
        top: 76px;
        right: 16px;
        width: 370px;
        max-height: calc(100dvh - 225px);
        overflow-y: auto;
        z-index: 900;
        border: 1px solid rgba(225, 232, 240, 0.95);
        background: rgba(255, 255, 255, 0.97);
        border-radius: 16px;
        box-shadow: 0 12px 36px rgba(20, 39, 65, 0.2);
        backdrop-filter: blur(12px);
        font-family: inherit;
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 transparent;
      }

      .header {
        padding: 16px 18px 14px;
        border-bottom: 1px solid #edf1f6;
      }
      .title-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .title-row h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #1d3049;
        flex: 1;
      }
      :host ::ng-deep .close-btn {
        width: 28px !important;
        height: 28px !important;
        color: #6b7280 !important;
      }
      :host ::ng-deep .close-btn:hover {
        background: #f3f4f6 !important;
        color: #1f2937 !important;
      }
      .subtitle {
        margin-top: 4px;
        font-size: 13px;
        color: #77869a;
      }

      .status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #6b7280;
        flex-shrink: 0;
      }
      .status-dot.online {
        background: #22c55e;
        box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.25);
      }
      .status-dot.idle {
        background: #eab308;
      }
      .status-dot.offline {
        background: #ef4444;
      }

      :host ::ng-deep .info-tabs .p-tabview-nav {
        display: flex;
        overflow-x: auto;
        border-top: 0 !important;
        border-bottom: 1px solid #edf1f6 !important;
        padding: 0 8px;
      }
      :host ::ng-deep .info-tabs .p-tabview-nav li {
        flex-shrink: 0;
      }
      :host ::ng-deep .info-tabs .p-tabview-nav li .p-tabview-nav-link {
        padding: 10px 12px !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        white-space: nowrap;
      }
      :host ::ng-deep .info-tabs .p-tabview-panels {
        padding: 14px 16px 18px !important;
        background: transparent !important;
      }

      .tab-header {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .view {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .muted {
        font-size: 12px;
        color: #6b7280;
        margin: 0 0 4px;
      }

      .stat-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .stat {
        border: 1px solid #edf1f6;
        background: #f8fafd;
        border-radius: 11px;
        padding: 11px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .stat-label {
        font-size: 11px;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .stat-value {
        font-size: 18px;
        font-weight: 700;
        color: #0f172a;
      }
      .stat-value small {
        font-size: 11px;
        font-weight: 500;
        color: #6b7280;
      }
      .stat-value.small {
        font-size: 13px;
        font-weight: 600;
      }

      .control-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 6px;
      }
      :host ::ng-deep .w-full {
        width: 100%;
        justify-content: center;
      }

      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f1f5f9;
        font-size: 13px;
      }
      .info-row:last-child {
        border-bottom: none;
      }
      .info-row span {
        color: #6b7280;
      }
      .info-row strong {
        color: #0f172a;
        font-weight: 600;
      }

      .trip-summary {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .trip-stat {
        border: 1px solid #edf1f6;
        background: #f8fafd;
        border-radius: 11px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .trip-stat span {
        font-size: 11px;
        color: #6b7280;
      }
      .trip-stat strong {
        font-size: 16px;
        color: #0f172a;
      }

      .dashcam-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 30px 20px;
        background: #0f172a;
        border-radius: 12px;
        color: #94a3b8;
      }
      .dashcam-placeholder .pi {
        font-size: 36px;
      }
      .dashcam-placeholder p {
        margin: 0;
        font-weight: 600;
        color: #cbd5e1;
      }
      .dashcam-placeholder small {
        font-size: 11px;
      }

      .chart {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        height: 100px;
        padding: 8px;
        background: #f3f6fb;
        border-radius: 11px;
      }
      .bar {
        flex: 1;
        background: linear-gradient(to top, #2563eb, #60a5fa);
        border-radius: 4px 4px 0 0;
      }
      .report-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .report-list li {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid #f1f5f9;
        font-size: 13px;
      }
      .report-list li span {
        color: #6b7280;
      }
      .report-list li strong {
        color: #0f172a;
      }

      .geo-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .geo-list li {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        border: 1px solid #edf1f6;
        background: #f8fafd;
        border-radius: 11px;
      }
      .geo-list strong {
        display: block;
        font-size: 13px;
        color: #0f172a;
      }
      .geo-list small {
        font-size: 11px;
        color: #6b7280;
      }
      .geo-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #22c55e;
      }
      .geo-dot.warn {
        background: #ef4444;
      }

      @media (max-width: 720px) {
        .info-panel {
          top: auto;
          right: 10px;
          bottom: 160px;
          left: 10px;
          width: auto;
          max-height: min(42dvh, 330px);
          border-radius: 15px;
        }

        :host ::ng-deep .info-tabs .p-tabview-nav {
          padding: 0 4px;
        }

        :host ::ng-deep .info-tabs .p-tabview-nav li .p-tabview-nav-link {
          padding: 9px 10px !important;
          font-size: 11px !important;
        }

        :host ::ng-deep .info-tabs .p-tabview-panels {
          padding: 12px 14px 14px !important;
        }
      }

      @media (max-width: 420px) {
        .info-panel {
          bottom: 150px;
          left: 8px;
          right: 8px;
          max-height: 38dvh;
        }

        .stat-grid {
          gap: 7px;
        }
      }
    `,
  ],
})
export class InfoPanelComponent {
  readonly gps = inject(GpsService);

  bars = [40, 70, 30, 55, 90, 60, 45];

  private readonly viewToIndex: Record<PanelView, number> = {
    control: 0,
    posicion: 1,
    trayecto: 2,
    dashcam: 3,
    informe: 4,
    geocerca: 5,
  };
  private readonly indexToView: PanelView[] = [
    'control',
    'posicion',
    'trayecto',
    'dashcam',
    'informe',
    'geocerca',
  ];

  readonly activeIndex = computed(() => this.viewToIndex[this.gps.activeView()]);

  onTabChange(event: { index: number }): void {
    const view = this.indexToView[event.index];
    if (view) this.gps.setView(view);
  }

  statusText(s: 'online' | 'offline' | 'idle'): string {
    return s === 'online' ? 'En línea' : s === 'idle' ? 'Detenido' : 'Sin señal';
  }
}
