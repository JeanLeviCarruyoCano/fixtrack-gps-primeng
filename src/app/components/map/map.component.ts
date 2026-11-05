import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  viewChild,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { GpsService } from '../../services/gps.service';
import { MapCommandService } from '../../services/map-command.service';
import { statusIconSvg } from '../../shared/status';

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
  private readonly streetTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  private readonly terrainTiles =
    'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
  private readonly defaultCenter: L.LatLngExpression = [-1.0438, -80.4559];
  private readonly topPadding = 72;

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
      untracked(() => {
        this.refreshMarkers();
        setTimeout(() => {
          this.map.flyTo(this.offsetCenter(device.lat, device.lng, 14), 14, { duration: 0.8 });
        });
      });
    });

    // Keep the selected vehicle visible when the sheet changes height
    effect(() => {
      this.cmd.bottomInset();
      const device = untracked(() => this.gps.selectedDevice());
      if (!this.map || !device) return;
      untracked(() => this.ensureVisible(device));
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
      untracked(() => {
        const dev = this.gps.selectedDevice();
        if (dev) this.map.flyTo(this.offsetCenter(dev.lat, dev.lng, 15), 15, { duration: 0.8 });
        else this.map.flyTo(this.defaultCenter, 13, { duration: 0.8 });
      });
    });
  }

  private offsetCenter(lat: number, lng: number, zoom: number): L.LatLng {
    const shift = (this.cmd.bottomInset() - this.topPadding) / 2;
    const point = this.map.project([lat, lng], zoom).add([0, shift]);
    return this.map.unproject(point, zoom);
  }

  private ensureVisible(device: { lat: number; lng: number }): void {
    const inset = this.cmd.bottomInset();
    const size = this.map.getSize();
    const y = this.map.latLngToContainerPoint([device.lat, device.lng]).y;
    const top = this.topPadding + 30;
    const bottom = size.y - inset - 30;
    if (y < top || y > bottom) {
      this.map.panTo(this.offsetCenter(device.lat, device.lng, this.map.getZoom()), {
        animate: true,
        duration: 0.3,
      });
    }
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapEl().nativeElement, {
      center: this.defaultCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
      worldCopyJump: true,
    });

    this.tileLayer = L.tileLayer(this.streetTiles, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
        ? 'Tiles &copy; Esri, Maxar, Earthstar Geographics'
        : layer === 'streets'
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
          <div class="gps-marker-container">
            <span class="gps-marker ${isSelected ? 'selected' : ''} status-${device.status}" data-track="marker-${device.id}">
              <i class="pi pi-car"></i>
              <span class="gps-marker-badge">${statusIconSvg(device.status, 10)}</span>
            </span>
            <span class="gps-marker-label">${device.label}</span>
          </div>
        `,
        iconSize: [80, 54],
        iconAnchor: [40, 27],
        popupAnchor: [0, -27],
      });

      let marker = this.markers.get(device.id);
      if (!marker) {
        marker = L.marker([device.lat, device.lng], { icon, title: `GPS ${device.label}` }).addTo(this.map);
        marker.on('click', () => this.gps.select(device.id));
        this.markers.set(device.id, marker);
      } else {
        marker.setLatLng([device.lat, device.lng]);
        marker.setIcon(icon);
      }

      marker.bindPopup(
        `<div class="popup-vehicle">
          <span class="popup-vehicle-id">${device.label}</span>
          <span class="popup-vehicle-speed">${device.speed} km/h</span>
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
