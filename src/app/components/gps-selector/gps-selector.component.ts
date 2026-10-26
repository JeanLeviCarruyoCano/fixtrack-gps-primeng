import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { GpsService } from '../../services/gps.service';

@Component({
  selector: 'app-gps-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  template: `
    <p-dropdown
      [options]="devices()"
      [(ngModel)]="selected"
      optionValue="id"
      optionLabel="label"
      placeholder="Sin GPS seleccionado"
      styleClass="gps-select"
      [filter]="true"
      filterBy="label,vehicle"
      (onChange)="onSelect($event)"
    >
      <ng-template pTemplate="selectedItem" let-item>
        <div class="selected-row" *ngIf="item; else placeholderTpl">
          <span
            class="status-dot"
            [class.online]="item.status === 'online'"
            [class.idle]="item.status === 'idle'"
            [class.offline]="item.status === 'offline'"
          ></span>
          <span class="selected-label">{{ item.label }} · {{ item.vehicle }}</span>
        </div>
        <ng-template #placeholderTpl>
          <div class="placeholder-row">
            <i class="pi pi-map-marker"></i>
            <div class="placeholder-text">
              <div class="ph-main">Sin GPS seleccionado</div>
              <div class="ph-sub">Selecciona un GPS</div>
            </div>
          </div>
        </ng-template>
      </ng-template>

      <ng-template pTemplate="item" let-item>
        <div class="option-row">
          <span
            class="status-dot"
            [class.online]="item.status === 'online'"
            [class.idle]="item.status === 'idle'"
            [class.offline]="item.status === 'offline'"
          ></span>
          <div class="option-main">
            <div class="option-label">{{ item.label }}</div>
            <div class="option-sub">{{ item.vehicle }}</div>
          </div>
          <div class="option-meta">
            <div class="speed">{{ item.speed }} km/h</div>
            <div class="status-text">{{ statusText(item.status) }}</div>
          </div>
        </div>
      </ng-template>
    </p-dropdown>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      :host ::ng-deep .gps-select {
        width: 100%;
      }
      :host ::ng-deep .gps-select.p-dropdown {
        width: 100%;
        background: #fff !important;
        border: 1px solid #e5ebf2 !important;
        border-radius: 12px !important;
        height: 48px !important;
        box-shadow: none;
      }
      :host ::ng-deep .gps-select.p-dropdown:hover {
        border-color: #cbd7e7 !important;
      }
      :host ::ng-deep .gps-select.p-dropdown.p-focus {
        border-color: #8bb0fa !important;
        box-shadow: 0 0 0 3px rgba(57, 120, 246, 0.1);
      }
      :host ::ng-deep .gps-select .p-dropdown-label {
        color: #34465e !important;
      }
      :host ::ng-deep
        .gps-select.p-dropdown.p-component.p-inputwrapper-filled
        .p-dropdown-label {
        color: #34465e !important;
      }
      :host ::ng-deep .gps-select .p-dropdown-label {
        font-size: 14px;
        font-weight: 600;
      }

      .selected-row,
      .placeholder-row {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
      }
      .selected-label {
        font-size: 14px;
        font-weight: 600;
        color: #34465e;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
      }
      .placeholder-row {
        flex: 1;
        color: #8290a3;
      }
      .placeholder-row .pi {
        font-size: 16px;
        color: #60748f;
      }
      .placeholder-text {
        flex: 1;
      }
      .ph-main {
        font-size: 14px;
        font-weight: 600;
        color: #34465e;
        line-height: 1.2;
      }
      .ph-sub {
        font-size: 11px;
        color: #8290a3;
        font-weight: 500;
      }

      .option-row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 4px 0;
      }
      .option-main {
        flex: 1;
        min-width: 0;
      }
      .option-label {
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
      }
      .option-sub {
        font-size: 11px;
        color: #6b7280;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .option-meta {
        text-align: right;
      }
      .speed {
        font-size: 12px;
        font-weight: 600;
        color: #0f172a;
      }
      .status-text {
        font-size: 10px;
        color: #6b7280;
      }

      .status-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        flex-shrink: 0;
        background: #6b7280;
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
    `,
  ],
})
export class GpsSelectorComponent {
  readonly gps = inject(GpsService);

  get devices() {
    return this.gps.devices;
  }

  get selected(): string | null {
    return this.gps.selectedId();
  }
  set selected(v: string | null) {
    this.gps.select(v);
  }

  onSelect(_event: any): void {
    // value already set via ngModel binding
  }

  statusText(s: 'online' | 'offline' | 'idle'): string {
    return s === 'online' ? 'En línea' : s === 'idle' ? 'Detenido' : 'Sin señal';
  }
}
