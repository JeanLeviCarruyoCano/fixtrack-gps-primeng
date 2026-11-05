import { Injectable, signal, computed } from '@angular/core';
import { GpsDevice, GPS_DEVICES, GpsAlert, PanelView, buildAlerts } from '../models/gps.model';

@Injectable({ providedIn: 'root' })
export class GpsService {
  /** All known GPS devices */
  private readonly _devices = signal<GpsDevice[]>([...GPS_DEVICES]);

  /** Currently selected device id (null = none) */
  private readonly _selectedId = signal<string | null>(null);

  /** Currently active bottom-panel view */
  private readonly _activeView = signal<PanelView>('control');

  /** Side menu open state */
  private readonly _menuOpen = signal<boolean>(false);

  /** Map layer type */
  private readonly _layer = signal<'satellite' | 'streets' | 'terrain'>('streets');

  // Public read-only signals
  readonly devices = this._devices.asReadonly();
  readonly selectedId = this._selectedId.asReadonly();
  readonly activeView = this._activeView.asReadonly();
  readonly menuOpen = this._menuOpen.asReadonly();
  readonly layer = this._layer.asReadonly();

  readonly selectedDevice = computed<GpsDevice | null>(() => {
    const id = this._selectedId();
    return this._devices().find((d) => d.id === id) ?? null;
  });

  readonly onlineCount = computed(
    () => this._devices().filter((d) => d.status === 'online').length
  );

  readonly notificationsCount = computed(() => this.alerts().length);

  readonly alerts = computed<GpsAlert[]>(() => buildAlerts(this._devices()));

  select(id: string | null): void {
    this._selectedId.set(id);
  }

  setView(view: PanelView): void {
    if (this._selectedId() === null) {
      // Do nothing if no GPS selected — UI will prompt user
      return;
    }
    this._activeView.set(view);
  }

  toggleMenu(): void {
    this._menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this._menuOpen.set(false);
  }

  setLayer(layer: 'satellite' | 'streets' | 'terrain'): void {
    this._layer.set(layer);
  }
}
