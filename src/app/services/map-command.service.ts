import { Injectable, signal } from '@angular/core';

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

  readonly zoomInTick = this._zoomIn.asReadonly();
  readonly zoomOutTick = this._zoomOut.asReadonly();
  readonly recenterTick = this._recenter.asReadonly();

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
