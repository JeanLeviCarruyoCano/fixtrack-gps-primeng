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
        ></p-button>
        <p-badge
          *ngIf="gps.notificationsCount() > 0"
          [value]="gps.notificationsCount()"
          severity="danger"
          styleClass="menu-badge"
        ></p-badge>
      </div>

      <div class="brand">
        <i class="pi pi-map-marker brand-logo"></i>
        <span class="brand-name">FixTrack<strong>GPS</strong></span>
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
        gap: 10px;
      }

      .menu-btn-wrapper {
        position: relative;
      }

      :host ::ng-deep .menu-btn {
        width: 44px !important;
        height: 44px !important;
        background: rgba(255, 255, 255, 0.96) !important;
        border: 1px solid rgba(225, 232, 240, 0.9) !important;
        color: #34465e !important;
        border-radius: 13px !important;
        box-shadow: 0 6px 18px rgba(20, 39, 65, 0.13);
      }
      :host ::ng-deep .menu-btn:hover {
        background: #f5f8fc !important;
      }
      :host ::ng-deep .menu-btn .pi {
        font-size: 1.1rem;
      }
      :host ::ng-deep .menu-badge {
        position: absolute !important;
        top: -6px;
        right: -6px;
        box-shadow: 0 0 0 2px #ffffff;
        min-width: 18px;
        height: 18px;
        border-radius: 9px;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 11px 15px;
        border: 1px solid rgba(225, 232, 240, 0.9);
        background: rgba(255, 255, 255, 0.96);
        border-radius: 13px;
        box-shadow: 0 6px 18px rgba(20, 39, 65, 0.13);
      }
      .brand-logo {
        display: grid;
        width: 27px;
        height: 27px;
        place-items: center;
        border-radius: 9px;
        background: #eaf1ff;
        color: #2563eb;
        font-size: 14px;
      }
      .brand-name {
        font-size: 14px;
        font-weight: 500;
        color: #1d3049;
        letter-spacing: 0.2px;
      }
      .brand-name strong {
        color: #3978f6;
        font-weight: 700;
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

        .brand {
          padding: 7px 10px;
        }
      }
    `,
  ],
})
export class TopBarComponent {
  readonly gps = inject(GpsService);
}
