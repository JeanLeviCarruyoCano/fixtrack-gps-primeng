import { Injectable, signal } from '@angular/core';

export type AppPanel = 'alerts' | 'settings' | 'help';

@Injectable({ providedIn: 'root' })
export class UiPanelService {
  private readonly _open = signal<AppPanel | null>(null);
  readonly open = this._open.asReadonly();

  show(panel: AppPanel): void {
    this._open.set(panel);
  }

  close(): void {
    this._open.set(null);
  }
}
