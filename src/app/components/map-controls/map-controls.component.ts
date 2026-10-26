import {
  Component,
  inject,
  signal,
  ViewChild,
  TemplateRef,
  viewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { GpsService } from '../../services/gps.service';
import { MapCommandService } from '../../services/map-command.service';

@Component({
  selector: 'app-map-controls',
  standalone: true,
  imports: [CommonModule, ButtonModule, MenuModule],
  template: `
    <div class="controls" [class.with-info-panel]="gps.selectedDevice() !== null">
      <!-- Layer toggle button -->
      <button
        pButton
        type="button"
        icon="pi pi-map"
        class="p-button-text p-button-rounded round-btn"
        (click)="layerMenu.toggle($event)"
        aria-label="Capas"
      ></button>
      <p-menu
        #layerMenu
        [model]="layerItems"
        [popup]="true"
        appendTo="body"
        styleClass="layer-menu-popup"
      ></p-menu>

      <!-- Zoom group -->
      <div class="zoom-group">
        <button
          pButton
          type="button"
          icon="pi pi-plus"
          class="p-button-text p-button-rounded round-btn zoom-btn"
          (click)="cmd.zoomIn()"
          aria-label="Acercar"
        ></button>
        <div class="separator"></div>
        <button
          pButton
          type="button"
          icon="pi pi-minus"
          class="p-button-text p-button-rounded round-btn zoom-btn"
          (click)="cmd.zoomOut()"
          aria-label="Alejar"
        ></button>
      </div>

      <!-- Recenter button -->
      <button
        pButton
        type="button"
        icon="pi pi-map-marker"
        class="p-button-text p-button-rounded round-btn compass"
        (click)="cmd.recenter()"
        aria-label="Centrar"
      ></button>
    </div>
  `,
  styles: [
    `
      .controls {
        position: absolute;
        right: 18px;
        bottom: 200px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 9px;
      }

      .controls.with-info-panel {
        right: 390px;
      }

      :host ::ng-deep .round-btn {
        width: 42px !important;
        height: 42px !important;
        background: rgba(255, 255, 255, 0.97) !important;
        color: #34465e !important;
        border: 1px solid #e3eaf2 !important;
        border-radius: 12px !important;
        box-shadow: 0 5px 16px rgba(20, 39, 65, 0.16);
      }
      :host ::ng-deep .round-btn:hover {
        background: #f3f4f6 !important;
      }
      :host ::ng-deep .round-btn.compass {
        color: #2563eb !important;
      }
      :host ::ng-deep .round-btn .pi {
        font-size: 1.05rem;
      }

      .zoom-group {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        background: white;
        border: 1px solid #e3eaf2;
        border-radius: 12px;
        box-shadow: 0 5px 16px rgba(20, 39, 65, 0.16);
        overflow: hidden;
      }
      :host ::ng-deep .zoom-group .zoom-btn {
        box-shadow: none !important;
        border-radius: 0 !important;
      }
      .separator {
        height: 1px;
        background: #e5e7eb;
      }

      @media (max-width: 540px) {
        .controls {
          right: 9px;
          bottom: 197px;
        }
        :host ::ng-deep .round-btn {
          width: 38px !important;
          height: 38px !important;
        }
      }

      @media (max-width: 720px) {
        .controls.with-info-panel {
          right: 9px;
          bottom: calc(160px + min(42dvh, 330px) + 12px);
        }
      }
    `,
  ],
})
export class MapControlsComponent {
  readonly gps = inject(GpsService);
  readonly cmd = inject(MapCommandService);

  readonly layerMenu = viewChild('layerMenu');

  layerItems: MenuItem[] = [
    {
      label: 'Satélite',
      icon: 'pi pi-globe',
      command: () => this.gps.setLayer('satellite'),
    },
    {
      label: 'OpenStreetMap',
      icon: 'pi pi-map',
      command: () => this.gps.setLayer('streets'),
    },
    {
      label: 'Terreno',
      icon: 'pi pi-image',
      command: () => this.gps.setLayer('terrain'),
    },
  ];
}
