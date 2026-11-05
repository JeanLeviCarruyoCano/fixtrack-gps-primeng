import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { GpsService } from '../../services/gps.service';
import { MapCommandService } from '../../services/map-command.service';
import { PanelView } from '../../models/gps.model';
import { UiPanelService } from '../../settings/ui-panel.service';

interface MenuItem {
  icon: string;
  label: string;
  badge?: number;
  action: 'map' | 'vehicles' | PanelView | 'alerts' | 'settings' | 'help';
}

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, SidebarModule, ButtonModule, BadgeModule, RippleModule],
  template: `
    <p-sidebar
      [(visible)]="visible"
      [modal]="true"
      [dismissible]="true"
      [showCloseIcon]="false"
      appendTo="body"
      [style]="{ width: '320px' }"
      styleClass="app-sidebar"
    >
      <ng-template pTemplate="header">
        <div class="header">
          <div class="brand-row">
            <span class="brand-mark"><i class="pi pi-map-marker brand-logo"></i></span>
            <span class="brand-name">FixTrack<strong>GPS</strong></span>
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="content">
        <div class="summary">
          <div class="summary-item">
            <span class="value">{{ gps.devices().length }}</span>
            <span class="label">Dispositivos</span>
          </div>
          <div class="summary-item">
            <span class="value online">{{ gps.onlineCount() }}</span>
            <span class="label">En línea</span>
          </div>
          <div class="summary-item">
            <span class="value alert">{{ gps.notificationsCount() }}</span>
            <span class="label">Alertas</span>
          </div>
        </div>

        <nav class="nav">
          <button
            *ngFor="let item of items"
            type="button"
            class="nav-item"
            [class.active]="isActive(item)"
            [attr.aria-current]="isActive(item) ? 'page' : null"
            pRipple
            [attr.data-track]="'menu-' + item.label"
            (click)="onMenuItemClick(item)"
          >
            <i class="pi" [class]="item.icon"></i>
            <span class="text">{{ item.label }}</span>
            <p-badge
              *ngIf="badgeFor(item)"
              [value]="badgeFor(item)"
              severity="danger"
            ></p-badge>
          </button>
        </nav>
      </ng-template>

      <ng-template pTemplate="footer">
        <div class="user">
          <div class="avatar">AD</div>
          <div class="user-info">
            <div class="user-name">Admin Demo</div>
            <div class="user-email">admin&#64;fixtrackgps.com</div>
          </div>
          <button
            type="button"
            class="logout-btn"
            pRipple
            (click)="cerrarSesion()"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <i class="pi pi-sign-out"></i>
          </button>
        </div>
      </ng-template>
    </p-sidebar>
  `,
  styles: [
    `
      .header {
        min-height: 78px;
        padding: 17px 20px;
        background: var(--surface);
        color: var(--text-strong);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .brand-row {
        display: flex;
        align-items: center;
        gap: 11px;
      }
      .brand-mark {
        display: grid;
        width: 34px;
        height: 34px;
        place-items: center;
        border: 1px solid var(--border);
        border-radius: 11px;
        background: var(--surface-sunken);
      }
      .brand-logo {
        color: var(--accent);
        font-size: 1rem;
      }
      .brand-name {
        color: var(--text-strong);
        font-size: 1.0625rem;
        font-weight: 500;
      }
      .brand-name strong {
        color: var(--accent);
        font-weight: 700;
      }

      .summary {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        padding: 19px 12px;
        border-bottom: 1px solid var(--border);
      }
      .summary-item {
        text-align: center;
      }
      .value {
        display: block;
        font-size: 1.3125rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .value.online {
        color: var(--status-online);
      }
      .value.alert {
        color: var(--status-offline);
      }
      .label {
        margin-top: 3px;
        font-size: 0.5625rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }

      .nav {
        padding: 14px 11px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 11px 13px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 10px;
        color: var(--text-strong);
        font-size: 0.875rem;
        font-weight: 500;
        text-align: left;
        transition: background 0.15s ease;
      }
      .nav-item:hover {
        background: var(--surface-hover);
      }
      .nav-item.active {
        background: var(--accent-soft);
        color: var(--accent);
      }
      .nav-item.active .pi {
        color: var(--accent);
      }
      .nav-item:focus-visible {
        outline: 2px solid var(--focus-ring);
        outline-offset: 2px;
      }
      .nav-item .pi {
        font-size: 16px;
        color: var(--accent);
        width: 20px;
        text-align: center;
      }
      .text {
        flex: 1;
      }

      .user {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--accent), var(--text-strong));
        color: var(--surface);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 13px;
      }
      .user-info {
        flex: 1;
        min-width: 0;
      }
      .user-name {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      .user-email {
        font-size: 0.6875rem;
        color: var(--text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .logout-btn {
        display: grid;
        width: 36px;
        height: 36px;
        flex: 0 0 auto;
        place-items: center;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        color: var(--text-secondary);
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
      }
      .logout-btn:hover {
        border-color: var(--status-offline);
        background: var(--status-offline-bg);
        color: var(--status-offline);
      }
      .logout-btn:focus-visible {
        outline: 2px solid var(--focus-ring);
        outline-offset: 2px;
      }
    `,
  ],
})
export class SideMenuComponent {
  readonly gps = inject(GpsService);
  private readonly router = inject(Router);
  private readonly mapCommand = inject(MapCommandService);
  private readonly messageService = inject(MessageService);
  private readonly panels = inject(UiPanelService);

  get visible(): boolean {
    return this.gps.menuOpen();
  }
  set visible(v: boolean) {
    if (!v) this.gps.closeMenu();
  }

  onMenuItemClick(item: MenuItem): void {
    switch (item.action) {
      case 'map':
        this.gps.closeMenu();
        this.mapCommand.recenter();
        return;
      case 'vehicles':
        this.openView('control');
        return;
      case 'alerts':
        this.gps.closeMenu();
        this.panels.show('alerts');
        return;
      case 'settings':
        this.gps.closeMenu();
        this.panels.show('settings');
        return;
      case 'help':
        this.gps.closeMenu();
        this.panels.show('help');
        return;
      default:
        this.openView(item.action);
    }
  }

  badgeFor(item: MenuItem): number | null {
    if (item.action === 'alerts') return this.gps.notificationsCount() || null;
    if (item.action === 'vehicles') return this.gps.devices().length || null;
    return item.badge ?? null;
  }

  isActive(item: MenuItem): boolean {
    if (item.action === 'map' || item.action === 'vehicles') return false;
    return this.gps.selectedDevice() !== null && this.gps.activeView() === item.action;
  }

  private openView(view: PanelView): void {
    if (this.gps.devices().length === 0) {
      this.gps.closeMenu();
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin dispositivos',
        detail: 'No hay dispositivos GPS disponibles.',
      });
      return;
    }

    if (!this.gps.selectedDevice()) {
      this.gps.select(this.gps.devices()[0].id);
    }
    this.gps.setView(view);
    this.gps.closeMenu();
  }

  cerrarSesion(): void {
    this.gps.closeMenu();
    void this.router.navigate(['/login']);
  }

  items: MenuItem[] = [
    { icon: 'pi pi-map', label: 'Mapa en vivo', action: 'map' },
    { icon: 'pi pi-car', label: 'Mis vehículos', badge: 4, action: 'vehicles' },
    { icon: 'pi pi-map-marker', label: 'Geocercas', action: 'geocerca' },
    { icon: 'pi pi-directions', label: 'Trayectos', action: 'trayecto' },
    { icon: 'pi pi-chart-bar', label: 'Informes', action: 'informe' },
    { icon: 'pi pi-video', label: 'Dashcam', action: 'dashcam' },
    { icon: 'pi pi-bell', label: 'Alertas', badge: 4, action: 'alerts' },
    { icon: 'pi pi-cog', label: 'Configuración', action: 'settings' },
    { icon: 'pi pi-question-circle', label: 'Ayuda', action: 'help' },
  ];
}
