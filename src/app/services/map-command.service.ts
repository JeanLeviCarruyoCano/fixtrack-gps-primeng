import { Injectable, computed, signal } from '@angular/core';

/**
 * Tiny event-bus service used to send map commands from UI components
 * (zoom in, zoom out, recenter, swap tiles) to the MapComponent without
 * passing the MapComponent instance around.
 */
@Injectable({ providedIn: 'root' })
export class MapCommandService {
  /** Monotonic counter — MapComponent subscribes and reacts to each tick. */
  private _zoomIn = signal(0);
  private _zoomOut = signal(0);
  private _recenter = signal(0);
  private readonly _navHeight = signal(0);
  private readonly _sheetHeight = signal(0);

  readonly zoomInTick = this._zoomIn.asReadonly();
  readonly zoomOutTick = this._zoomOut.asReadonly();
  readonly recenterTick = this._recenter.asReadonly();
  readonly navHeight = this._navHeight.asReadonly();
  readonly sheetHeight = this._sheetHeight.asReadonly();
  /** Pixels of the map covered from the bottom edge by the navigation bar and the detail sheet. */
  readonly bottomInset = computed(() => this._navHeight() + this._sheetHeight());

  /** Distance from the viewport bottom to the top edge of the navigation bar. */
  setNavHeight(px: number): void {
    this._navHeight.set(Math.max(0, Math.round(px)));
  }

  /** Settled height of the detail sheet plus its gap; 0 when hidden. */
  setSheetHeight(px: number): void {
    this._sheetHeight.set(Math.max(0, Math.round(px)));
  }

  zoomIn(): void {
    this._zoomIn.update((v) => v + 1);
  }
  zoomOut(): void {
    this._zoomOut.update((v) => v + 1);
  }
  recenter(): void {
    this._recenter.update((v) => v + 1);
  }
}
