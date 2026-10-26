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
            (click)="onMenuItemClick(item)"
          >
            <i class="pi" [class]="item.icon"></i>
            <span class="text">{{ item.label }}</span>
            <p-badge
              *ngIf="item.badge"
              [value]="item.badge"
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
        background: #ffffff;
        color: #1d3049;
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
        border: 1px solid #e5ebf5;
        border-radius: 11px;
        background: #f3f6fb;
      }
      .brand-logo {
        color: #3978f6;
        font-size: 16px;
      }
      .brand-name {
        color: #1d3049;
        font-size: 17px;
        font-weight: 500;
      }
      .brand-name strong {
        color: #3978f6;
        font-weight: 700;
      }

      .summary {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        padding: 19px 12px;
        border-bottom: 1px solid #edf1f6;
      }
      .summary-item {
        text-align: center;
      }
      .value {
        display: block;
        font-size: 21px;
        font-weight: 700;
        color: #0f172a;
      }
      .value.online {
        color: #16a34a;
      }
      .value.alert {
        color: #ef4444;
      }
      .label {
        margin-top: 3px;
        font-size: 9px;
        color: #6b7280;
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
        color: #43536a;
        font-size: 14px;
        font-weight: 500;
        text-align: left;
        transition: background 0.15s ease;
      }
      .nav-item:hover {
        background: #f2f6fc;
      }
      .nav-item.active {
        background: #edf3ff;
        color: #2563eb;
      }
      .nav-item.active .pi {
        color: #2563eb;
      }
      .nav-item:focus-visible {
        outline: 2px solid #8bb0fa;
        outline-offset: 2px;
      }
      .nav-item .pi {
        font-size: 16px;
        color: #5d82c7;
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
        background: linear-gradient(135deg, #3b82f6, #1e40af);
        color: white;
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
        font-size: 13px;
        font-weight: 600;
        color: #0f172a;
      }
      .user-email {
        font-size: 11px;
        color: #6b7280;
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
        border: 1px solid #e7ebf0;
        border-radius: 10px;
        background: #fff;
        color: #718096;
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
      }
      .logout-btn:hover {
        border-color: #fecaca;
        background: #fff5f5;
        color: #dc2626;
      }
      .logout-btn:focus-visible {
        outline: 2px solid #8bb0fa;
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
        this.messageService.add({
          severity: 'info',
          summary: 'Alertas',
          detail: 'El panel de alertas estará disponible próximamente.',
        });
        return;
      case 'settings':
        this.showComingSoon('Configuración');
        return;
      case 'help':
        this.showComingSoon('Ayuda');
        return;
      default:
        this.openView(item.action);
    }
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

  private showComingSoon(feature: string): void {
    this.gps.closeMenu();
    this.messageService.add({
      severity: 'info',
      summary: feature,
      detail: `La sección de ${feature.toLowerCase()} estará disponible próximamente.`,
    });
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
