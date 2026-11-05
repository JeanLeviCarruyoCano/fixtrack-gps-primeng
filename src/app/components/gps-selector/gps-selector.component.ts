import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { GpsService } from '../../services/gps.service';
import { GpsStatus } from '../../models/gps.model';
import { STATUS_LABEL, StatusBadgeComponent } from '../../shared/status';

@Component({
  selector: 'app-gps-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, StatusBadgeComponent],
  template: `
    <p-dropdown
      [options]="devices()"
      [(ngModel)]="selected"
      optionValue="id"
      optionLabel="label"
      placeholder="Sin GPS seleccionado"
      styleClass="gps-select"
      data-track="selector-vehiculo"
      ariaLabel="Seleccionar vehículo"
      [filter]="true"
      filterBy="label,vehicle"
      (onChange)="onSelect($event)"
    >
      <ng-template pTemplate="selectedItem" let-item>
        <div class="selected-row" *ngIf="item; else placeholderTpl">
          <app-status-badge [status]="item.status" [iconOnly]="true"></app-status-badge>
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
        <div class="option-row" [attr.data-track]="'vehiculo-' + item.id">
          <app-status-badge [status]="item.status" [iconOnly]="true"></app-status-badge>
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
        background: var(--surface) !important;
        border: 1px solid var(--border) !important;
        border-radius: 12px !important;
        height: 48px !important;
        box-shadow: none;
      }
      :host ::ng-deep .gps-select.p-dropdown:hover {
        border-color: var(--text-muted) !important;
      }
      :host ::ng-deep .gps-select.p-dropdown.p-focus {
        border-color: var(--accent) !important;
        box-shadow: 0 0 0 3px var(--accent-soft);
      }
      :host ::ng-deep .gps-select .p-dropdown-label {
        color: var(--text-strong) !important;
      }
      :host ::ng-deep
        .gps-select.p-dropdown.p-component.p-inputwrapper-filled
        .p-dropdown-label {
        color: var(--text-strong) !important;
      }
      :host ::ng-deep .gps-select .p-dropdown-label {
        font-size: 0.875rem;
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
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-strong);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
      }
      .placeholder-row {
        flex: 1;
        color: var(--text-muted);
      }
      .placeholder-row .pi {
        font-size: 16px;
        color: var(--text-secondary);
      }
      .placeholder-text {
        flex: 1;
      }
      .ph-main {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-strong);
        line-height: 1.2;
      }
      .ph-sub {
        font-size: 0.6875rem;
        color: var(--text-muted);
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
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .option-sub {
        font-size: 0.6875rem;
        color: var(--text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .option-meta {
        text-align: right;
      }
      .speed {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      .status-text {
        font-size: 0.625rem;
        color: var(--text-secondary);
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

  statusText(s: GpsStatus): string {
    return STATUS_LABEL[s];
  }
}