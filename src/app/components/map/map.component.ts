import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { GpsService } from '../../services/gps.service';
import { MapCommandService } from '../../services/map-command.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div #mapEl class="map-container"></div>`,
  styles: [
    `
      .map-container {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
      }
    `,
  ],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private readonly mapEl = viewChild.required<ElementRef<HTMLDivElement>>('mapEl');
  private readonly gps = inject(GpsService);
  private readonly cmd = inject(MapCommandService);

  private map!: L.Map;
  private markers = new Map<string, L.Marker>();
  private tileLayer!: L.TileLayer;

  private readonly satelliteTiles =
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  private readonly streetTiles =
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  private readonly terrainTiles =
    'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';

  constructor() {
    // React to layer changes
    effect(() => {
      const layer = this.gps.layer();
      if (!this.map) return;
      this.swapTiles(layer);
    });

    // React to selection — fly to device
    effect(() => {
      const device = this.gps.selectedDevice();
      if (!this.map || !device) return;
      this.map.flyTo([device.lat, device.lng], 14, { duration: 0.8 });
      this.refreshMarkers();
    });

    // React to devices list — refresh markers
    effect(() => {
      this.gps.devices();
      if (this.map) this.refreshMarkers();
    });

    // React to map commands from MapControlsComponent
    effect(() => {
      const tick = this.cmd.zoomInTick();
      if (tick > 0) this.map?.zoomIn();
    });
    effect(() => {
      const tick = this.cmd.zoomOutTick();
      if (tick > 0) this.map?.zoomOut();
    });
    effect(() => {
      const tick = this.cmd.recenterTick();
      if (tick === 0 || !this.map) return;
      const dev = this.gps.selectedDevice();
      if (dev) this.map.flyTo([dev.lat, dev.lng], 15, { duration: 0.8 });
      else this.map.flyTo([19.3426, -71.0703], 12, { duration: 0.8 });
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapEl().nativeElement, {
      center: [19.3426, -71.0703],
      zoom: 12,
      zoomControl: false,
      attributionControl: true,
      worldCopyJump: true,
    });

    this.tileLayer = L.tileLayer(this.satelliteTiles, {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.google.com/maps">Google</a> &copy; Esri, Maxar, Earthstar Geographics',
    }).addTo(this.map);

    // Custom scale bar (bottom-left, like Google Maps)
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(this.map);

    this.refreshMarkers();
  }

  private swapTiles(layer: 'satellite' | 'streets' | 'terrain'): void {
    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer);
    }
    const url =
      layer === 'satellite'
        ? this.satelliteTiles
        : layer === 'streets'
        ? this.streetTiles
        : this.terrainTiles;
    const attribution =
      layer === 'satellite'
        ? '&copy; <a href="https://www.google.com/maps">Google</a> &copy; Esri, Maxar, Earthstar Geographics'
        : layer === 'streets'
        ? '&copy; OpenStreetMap, &copy; CARTO'
        : '&copy; OpenStreetMap, &copy; OpenTopoMap';
    this.tileLayer = L.tileLayer(url, { maxZoom: 19, attribution }).addTo(this.map);
  }

  private refreshMarkers(): void {
    if (!this.map) return;

    const selectedId = this.gps.selectedId();
    const devices = this.gps.devices();

    // Remove markers no longer present
    for (const [id, marker] of this.markers) {
      if (!devices.find((d) => d.id === id)) {
        this.map.removeLayer(marker);
        this.markers.delete(id);
      }
    }

    // Add or update markers
    for (const device of devices) {
      const isSelected = device.id === selectedId;
      const icon = L.divIcon({
        className: 'gps-marker-wrapper',
        html: `
          <div style="position:relative;">
            ${isSelected ? '<div class="gps-marker-pulse"></div>' : ''}
            <div class="gps-marker-icon ${isSelected ? 'selected' : ''}">
              <span>${device.label}</span>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      let marker = this.markers.get(device.id);
      if (!marker) {
        marker = L.marker([device.lat, device.lng], { icon }).addTo(this.map);
        marker.on('click', () => this.gps.select(device.id));
        this.markers.set(device.id, marker);
      } else {
        marker.setLatLng([device.lat, device.lng]);
        marker.setIcon(icon);
      }

      const statusLabel =
        device.status === 'online'
          ? '🟢 En línea'
          : device.status === 'idle'
          ? '🟡 Detenido'
          : '🔴 Sin señal';
      marker.bindPopup(
        `<div style="min-width:180px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#0f172a;">${device.label}</div>
          <div style="color:#475569;margin-bottom:6px;">${device.vehicle}</div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#334155;">
            <span>Conductor:</span><strong>${device.driver ?? '—'}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#334155;">
            <span>Velocidad:</span><strong>${device.speed} km/h</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#334155;">
            <span>Estado:</span><strong>${statusLabel}</strong>
          </div>
        </div>`
      );
    }
  }

  flyTo(lat: number, lng: number, zoom: number): void {
    if (this.map) this.map.flyTo([lat, lng], zoom, { duration: 0.8 });
  }

  zoomIn(): void {
    this.map?.zoomIn();
  }

  zoomOut(): void {
    this.map?.zoomOut();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
