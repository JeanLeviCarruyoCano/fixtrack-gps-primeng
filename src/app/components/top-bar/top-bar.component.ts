import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { GpsService } from '../../services/gps.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, ButtonModule, BadgeModule],
  template: `
    <div class="top-bar">
      <div class="menu-btn-wrapper">
        <p-button
          (onClick)="gps.toggleMenu()"
          icon="pi pi-bars"
          styleClass="menu-btn"
          [text]="true"
          [rounded]="true"
          ariaLabel="Abrir menú"
          data-track="menu-abrir"
        ></p-button>
        <p-badge
          *ngIf="gps.notificationsCount() > 0"
          [value]="gps.notificationsCount()"
          severity="danger"
          styleClass="menu-badge"
        ></p-badge>
      </div>

    </div>
  `,
  styles: [
    `
      .top-bar {
        position: absolute;
        top: 16px;
        left: 16px;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 0;
      }

      .menu-btn-wrapper {
        position: relative;
      }

      :host ::ng-deep .menu-btn {
        width: 44px !important;
        height: 44px !important;
        background: var(--surface-glass) !important;
        border: 1px solid var(--border) !important;
        color: var(--text-strong) !important;
        border-radius: 13px !important;
        box-shadow: 0 6px 18px var(--shadow-color);
      }
      :host ::ng-deep .menu-btn:hover {
        background: var(--surface-hover) !important;
      }
      :host ::ng-deep .menu-btn .pi {
        font-size: 1.1rem;
      }
      :host ::ng-deep .menu-badge {
        position: absolute !important;
        top: -6px;
        right: -6px;
        box-shadow: 0 0 0 2px var(--surface);
        min-width: 18px;
        height: 18px;
        border-radius: 9px;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
      }

      @media (max-width: 540px) {
        .top-bar {
          top: 11px;
          left: 11px;
          gap: 7px;
        }

        :host ::ng-deep .menu-btn {
          width: 40px !important;
          height: 40px !important;
        }

      }
    `,
  ],
})
export class TopBarComponent {
  readonly gps = inject(GpsService);
}
