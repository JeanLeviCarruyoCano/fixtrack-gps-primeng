import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { GpsService } from '../../services/gps.service';
import { MapCommandService } from '../../services/map-command.service';
import { StatusBadgeComponent } from '../../shared/status';

type SheetState = 'collapsed' | 'medium' | 'full';

const STATES: SheetState[] = ['collapsed', 'medium', 'full'];
const COLLAPSED_HEIGHT = 76;
const GAP = 8;
const TOP_LIMIT = 72;
const DRAG_THRESHOLD = 5;

@Component({
  selector: 'app-info-panel',
  standalone: true,
  imports: [CommonModule, ButtonModule, StatusBadgeComponent],
  template: `
    <section
      class="sheet"
      *ngIf="gps.selectedDevice() as dev"
      [class.dragging]="dragHeight() !== null"
      [class.is-full]="state() === 'full'"
      [style.height.px]="height()"
      [style.bottom.px]="cmd.navHeight() + gap"
      role="region"
      [attr.aria-label]="'Detalle de ' + dev.label"
    >
      <div
        class="grab"
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="onPointerUp($event)"
        (pointercancel)="onPointerCancel($event)"
      >
        <div
          class="handle"
          role="button"
          tabindex="0"
          data-track="sheet-handle"
          [attr.aria-label]="'Ajustar altura del panel. Estado actual: ' + stateLabel()"
          [attr.aria-expanded]="state() !== 'collapsed'"
          (keydown)="onHandleKey($event)"
        >
          <span class="grip"></span>
        </div>
        <header class="head">
          <app-status-badge [status]="dev.status" [iconOnly]="true"></app-status-badge>
          <h2>{{ dev.label }}</h2>
          <span class="head-speed" data-track="sheet-speed">{{ dev.speed }} km/h</span>
          <button
            pButton
            type="button"
            icon="pi pi-times"
            class="p-button-text p-button-rounded close-btn"
            data-track="sheet-cerrar"
            (click)="gps.select(null)"
            aria-label="Cerrar detalle"
          ></button>
        </header>
      </div>

      <div
        class="body"
        #body
        [attr.aria-hidden]="state() === 'collapsed'"
        [class.scrollable]="state() === 'full'"
        (scroll)="updateScroll()"
      >
        <div class="content" #content [ngSwitch]="gps.activeView()">
          <div class="view" *ngSwitchCase="'control'">
            <div class="stat-grid">
              <div class="stat">
                <span class="stat-label">Velocidad</span>
                <span class="stat-value">{{ dev.speed }} <small>km/h</small></span>
              </div>
              <div class="stat">
                <span class="stat-label">Rumbo</span>
                <span class="stat-value">{{ dev.heading }}°</span>
              </div>
              <div class="stat" data-track="stat-estado">
                <span class="stat-label">Estado</span>
                <app-status-badge [status]="dev.status"></app-status-badge>
              </div>
              <div class="stat" data-track="stat-ultima-actualizacion">
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

          <div class="view" *ngSwitchCase="'posicion'">
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
            <div class="info-row" data-track="stat-ultima-actualizacion">
              <span>Última señal</span>
              <strong>{{ dev.lastUpdate | date: 'medium' }}</strong>
            </div>
          </div>

          <div class="view" *ngSwitchCase="'trayecto'">
            <p class="muted">Trayecto de las últimas 24 horas</p>
            <div class="trip-summary" data-track="trayecto-resumen">
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

          <div class="view" *ngSwitchCase="'dashcam'">
            <div class="dashcam-placeholder">
              <i class="pi pi-video"></i>
              <p>Sin transmisión en vivo</p>
              <small>Último clip: hoy 09:42</small>
            </div>
          </div>

          <div class="view" *ngSwitchCase="'informe'" data-track="informe-contenido">
            <p class="muted">Informe semanal de actividad</p>
            <div class="chart" role="img" aria-label="Gráfico de actividad semanal">
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

          <div class="view" *ngSwitchCase="'geocerca'">
            <p class="muted">Geocercas asignadas a este dispositivo</p>
            <ul class="geo-list">
              <li>
                <i class="pi pi-check-circle geo-icon ok" aria-hidden="true"></i>
                <div>
                  <strong>Oficina central</strong>
                  <small>Radio: 500 m · Activa</small>
                </div>
              </li>
              <li data-track="geocerca-alerta">
                <i class="pi pi-exclamation-triangle geo-icon alert" aria-hidden="true"></i>
                <div>
                  <strong>Zona de carga</strong>
                  <small>Radio: 200 m · Última alerta: hoy 08:15</small>
                </div>
              </li>
            </ul>
            <button pButton type="button" class="p-button-outlined w-full" icon="pi pi-plus" label="Crear nueva geocerca"></button>
          </div>
        </div>
      </div>

      <button
        *ngIf="state() === 'medium' && hasOverflow()"
        type="button"
        class="more-hint"
        data-track="sheet-ver-mas"
        (click)="setState('full')"
      >
        <i class="pi pi-chevron-up" aria-hidden="true"></i> Ver más
      </button>
      <div class="scroll-hint" *ngIf="state() === 'full' && hasOverflow() && !atEnd()" aria-hidden="true">
        <i class="pi pi-chevron-down"></i> Desplaza para ver más
      </div>
    </section>
  `,
  styles: [
    `
      .sheet {
        position: absolute;
        left: 50%;
        z-index: 950;
        display: flex;
        flex-direction: column;
        width: min(690px, calc(100vw - 28px));
        transform: translateX(-50%);
        overflow: hidden;
        border: 1px solid var(--border);
        border-radius: 17px;
        background: var(--surface-glass);
        box-shadow: 0 -6px 30px var(--shadow-color);
        font-family: inherit;
        transition: height var(--sheet-transition);
      }
      .sheet.dragging {
        transition: none;
      }

      .grab {
        flex-shrink: 0;
        touch-action: none;
        cursor: grab;
        user-select: none;
      }
      .sheet.dragging .grab {
        cursor: grabbing;
      }
      .handle {
        display: flex;
        height: 24px;
        align-items: center;
        justify-content: center;
        border-radius: 17px 17px 0 0;
      }
      .grip {
        width: 44px;
        height: 5px;
        border-radius: 5px;
        background: var(--text-muted);
      }
      .head {
        display: flex;
        min-height: 48px;
        align-items: center;
        gap: 10px;
        padding: 0 14px 6px 18px;
      }
      .head h2 {
        flex: 1;
        margin: 0;
        overflow: hidden;
        color: var(--text-primary);
        font-size: 1.125rem;
        font-weight: 700;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .head-speed {
        color: var(--text-secondary);
        font-size: 0.9375rem;
        font-weight: 700;
        white-space: nowrap;
      }
      :host ::ng-deep .close-btn {
        width: 28px !important;
        height: 28px !important;
        color: var(--text-secondary) !important;
      }
      :host ::ng-deep .close-btn:hover {
        background: var(--surface-hover) !important;
        color: var(--text-primary) !important;
      }

      .body {
        position: relative;
        flex: 1;
        min-height: 0;
        overflow: hidden;
        border-top: 1px solid var(--border);
      }
      .sheet:not(.is-full) .body {
        overflow-y: hidden;
      }
      .body.scrollable {
        overflow-y: scroll;
        scrollbar-width: thin;
        scrollbar-color: var(--text-muted) var(--scroll-track);
      }
      .content {
        padding: 14px 16px 22px;
      }

      .more-hint,
      .scroll-hint {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 6px;
        padding: 18px 0 8px;
        background: linear-gradient(to top, var(--surface) 55%, var(--surface-glass-clear));
        color: var(--accent);
        font: inherit;
        font-size: 0.75rem;
        font-weight: 700;
      }
      .more-hint {
        border: 0;
        cursor: pointer;
      }
      .scroll-hint {
        pointer-events: none;
      }
      .more-hint .pi,
      .scroll-hint .pi {
        font-size: 11px;
      }

      .view {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .muted {
        margin: 0 0 4px;
        color: var(--text-secondary);
        font-size: 0.75rem;
      }

      .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 10px;
      }
      .stat {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        padding: 11px 12px;
        border: 1px solid var(--border);
        border-radius: 11px;
        background: var(--surface-alt);
      }
      .stat-label {
        color: var(--text-secondary);
        font-size: 0.6875rem;
        letter-spacing: 0.3px;
        text-transform: uppercase;
      }
      .stat-value {
        color: var(--text-primary);
        font-size: 1.125rem;
        font-weight: 700;
      }
      .stat-value small {
        color: var(--text-secondary);
        font-size: 0.6875rem;
        font-weight: 500;
      }
      .stat-value.small {
        font-size: 0.8125rem;
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
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--border);
        font-size: 0.8125rem;
      }
      .info-row:last-child {
        border-bottom: none;
      }
      .info-row span {
        color: var(--text-secondary);
      }
      .info-row strong {
        color: var(--text-primary);
        font-weight: 600;
      }

      .trip-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px;
      }
      .trip-stat {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 10px 12px;
        border: 1px solid var(--border);
        border-radius: 11px;
        background: var(--surface-alt);
      }
      .trip-stat span {
        color: var(--text-secondary);
        font-size: 0.6875rem;
      }
      .trip-stat strong {
        color: var(--text-primary);
        font-size: 1rem;
      }

      .dashcam-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 30px 20px;
        border-radius: 12px;
        background: #0f172a;
        color: #a8b3c4;
      }
      .dashcam-placeholder .pi {
        font-size: 36px;
      }
      .dashcam-placeholder p {
        margin: 0;
        color: #cbd5e1;
        font-weight: 600;
      }
      .dashcam-placeholder small {
        font-size: 0.6875rem;
      }

      .chart {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        height: 100px;
        padding: 8px;
        border-radius: 11px;
        background: var(--surface-sunken);
      }
      .bar {
        flex: 1;
        border-radius: 4px 4px 0 0;
        background: linear-gradient(to top, var(--accent), var(--accent-soft));
      }
      .report-list {
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .report-list li {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid var(--border);
        font-size: 0.8125rem;
      }
      .report-list li span {
        color: var(--text-secondary);
      }
      .report-list li strong {
        color: var(--text-primary);
      }

      .geo-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .geo-list li {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        border: 1px solid var(--border);
        border-radius: 11px;
        background: var(--surface-alt);
      }
      .geo-list strong {
        display: block;
        color: var(--text-primary);
        font-size: 0.8125rem;
      }
      .geo-list small {
        color: var(--text-secondary);
        font-size: 0.6875rem;
      }
      .geo-icon.ok {
        color: var(--status-online);
      }
      .geo-icon.alert {
        color: var(--status-offline);
      }

      @media (max-width: 540px) {
        .sheet {
          width: calc(100vw - 20px);
          border-radius: 15px;
        }
        .content {
          padding: 12px 14px 22px;
        }
      }
    `,
  ],
})
export class InfoPanelComponent implements OnDestroy {
  readonly gps = inject(GpsService);
  readonly cmd = inject(MapCommandService);
  readonly gap = GAP;

  bars = [40, 70, 30, 55, 90, 60, 45];

  readonly state = signal<SheetState>('medium');
  readonly dragHeight = signal<number | null>(null);
  readonly hasOverflow = signal(false);
  readonly atEnd = signal(true);

  private readonly viewportHeight = signal(window.innerHeight);
  private readonly body = viewChild<ElementRef<HTMLElement>>('body');
  private readonly content = viewChild<ElementRef<HTMLElement>>('content');
  private observer?: ResizeObserver;

  private dragStart: { y: number; height: number; moved: boolean; onHandle: boolean } | null = null;

  readonly heights = computed<Record<SheetState, number>>(() => {
    const available = Math.max(
      COLLAPSED_HEIGHT + 120,
      this.viewportHeight() - this.cmd.navHeight() - GAP - TOP_LIMIT,
    );
    const medium = Math.min(available, Math.max(220, Math.round(available * 0.5)));
    return { collapsed: COLLAPSED_HEIGHT, medium, full: Math.max(available, medium) };
  });

  readonly height = computed(() => this.dragHeight() ?? this.heights()[this.state()]);

  readonly stateLabel = computed(() => {
    const labels: Record<SheetState, string> = {
      collapsed: 'colapsado',
      medium: 'medio',
      full: 'completo',
    };
    return labels[this.state()];
  });

  constructor() {
    effect(
      () => {
        const hasDevice = this.gps.selectedDevice() !== null;
        if (this.dragHeight() !== null) return;
        const height = this.height();
        this.cmd.setSheetHeight(hasDevice ? height + GAP : 0);
      },
      { allowSignalWrites: true },
    );

    effect(() => {
      this.gps.activeView();
      untracked(() => {
        if (this.state() === 'collapsed') this.state.set('medium');
        this.resetScroll();
      });
    });

    effect((onCleanup) => {
      const body = this.body()?.nativeElement;
      const content = this.content()?.nativeElement;
      if (!body || !content) return;
      this.observer?.disconnect();
      this.observer = new ResizeObserver(() => this.updateScroll());
      this.observer.observe(body);
      this.observer.observe(content);
      onCleanup(() => this.observer?.disconnect());
    });
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.viewportHeight.set(window.innerHeight);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.cmd.setSheetHeight(0);
  }

  setState(state: SheetState): void {
    this.state.set(state);
    if (state !== 'full') this.resetScroll();
  }

  updateScroll(): void {
    const body = this.body()?.nativeElement;
    if (!body) return;
    this.hasOverflow.set(body.scrollHeight > body.clientHeight + 1);
    this.atEnd.set(body.scrollTop + body.clientHeight >= body.scrollHeight - 2);
  }

  onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 || (event.target as HTMLElement).closest('.close-btn')) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.dragStart = {
      y: event.clientY,
      height: this.height(),
      moved: false,
      onHandle: !!(event.target as HTMLElement).closest('.handle'),
    };
  }

  onPointerMove(event: PointerEvent): void {
    const start = this.dragStart;
    if (!start) return;
    const delta = start.y - event.clientY;
    if (!start.moved && Math.abs(delta) < DRAG_THRESHOLD) return;
    start.moved = true;
    const { collapsed, full } = this.heights();
    this.dragHeight.set(Math.min(full, Math.max(collapsed, start.height + delta)));
  }

  onPointerUp(event: PointerEvent): void {
    const start = this.dragStart;
    this.dragStart = null;
    if (!start) return;
    (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
    if (start.moved) {
      this.snapToNearest(this.dragHeight() ?? start.height);
    } else if (start.onHandle) {
      this.cycle();
    }
    this.dragHeight.set(null);
  }

  onPointerCancel(event: PointerEvent): void {
    this.dragStart = null;
    (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
    this.dragHeight.set(null);
  }

  onHandleKey(event: KeyboardEvent): void {
    const index = STATES.indexOf(this.state());
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.cycle();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.setState(STATES[Math.min(STATES.length - 1, index + 1)]);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.setState(STATES[Math.max(0, index - 1)]);
    }
  }

  private cycle(): void {
    const next = this.state() === 'collapsed' ? 'medium' : this.state() === 'medium' ? 'full' : 'collapsed';
    this.setState(next);
  }

  private snapToNearest(height: number): void {
    const heights = this.heights();
    const nearest = STATES.reduce((best, s) =>
      Math.abs(heights[s] - height) < Math.abs(heights[best] - height) ? s : best,
    );
    this.setState(nearest);
  }

  private resetScroll(): void {
    const body = this.body()?.nativeElement;
    if (body) body.scrollTop = 0;
  }
}
