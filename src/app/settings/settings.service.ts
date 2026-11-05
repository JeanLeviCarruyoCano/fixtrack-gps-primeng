import { Injectable, effect, signal } from '@angular/core';

export type FontSize = 'pequeno' | 'normal' | 'grande' | 'muy-grande';
export type ThemeMode = 'claro' | 'oscuro' | 'contraste' | 'sistema';
export type Palette = 'azul' | 'verde' | 'violeta' | 'naranja' | 'rosa';
export type ColorBlindMode = 'ninguno' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface AppSettings {
  fontSize: FontSize;
  theme: ThemeMode;
  palette: Palette;
  colorBlind: ColorBlindMode;
  reduceMotion: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 'normal',
  theme: 'claro',
  palette: 'azul',
  colorBlind: 'ninguno',
  reduceMotion: false,
};

export const FONT_SCALE: Record<FontSize, number> = {
  pequeno: 0.875,
  normal: 1,
  grande: 1.15,
  'muy-grande': 1.3,
};

const THEME_ATTR: Record<Exclude<ThemeMode, 'sistema'>, string> = {
  claro: 'light',
  oscuro: 'dark',
  contraste: 'contrast',
};

const STORAGE_KEY = 'fixtrack.ajustes.v1';

const VALID: { [K in keyof AppSettings]: readonly AppSettings[K][] | 'boolean' } = {
  fontSize: ['pequeno', 'normal', 'grande', 'muy-grande'],
  theme: ['claro', 'oscuro', 'contraste', 'sistema'],
  palette: ['azul', 'verde', 'violeta', 'naranja', 'rosa'],
  colorBlind: ['ninguno', 'protanopia', 'deuteranopia', 'tritanopia'],
  reduceMotion: 'boolean',
};

export function sanitizeSettings(raw: unknown): AppSettings {
  const result: AppSettings = { ...DEFAULT_SETTINGS };
  if (typeof raw !== 'object' || raw === null) return result;
  const source = raw as Record<string, unknown>;
  const target = result as unknown as Record<string, unknown>;
  for (const key of Object.keys(VALID) as (keyof AppSettings)[]) {
    const rule = VALID[key];
    const value = source[key];
    const ok = rule === 'boolean' ? typeof value === 'boolean' : (rule as readonly unknown[]).includes(value);
    if (ok) target[key] = value;
  }
  return result;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly _settings = signal<AppSettings>(this.load());
  private readonly _systemDark = signal(false);

  readonly settings = this._settings.asReadonly();

  constructor() {
    const media = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
    if (media) {
      this._systemDark.set(media.matches);
      media.addEventListener('change', (e) => this._systemDark.set(e.matches));
    }
    effect(() => this.apply(this._settings(), this._systemDark()));
  }

  update<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this._settings.update((s) => ({ ...s, [key]: value }));
    this.save();
  }

  reset(): void {
    this._settings.set({ ...DEFAULT_SETTINGS });
    this.save();
  }

  private apply(s: AppSettings, systemDark: boolean): void {
    const root = document.documentElement;
    root.style.setProperty('--font-scale', String(FONT_SCALE[s.fontSize]));
    root.dataset['theme'] = THEME_ATTR[s.theme === 'sistema' ? (systemDark ? 'oscuro' : 'claro') : s.theme];
    this.toggle(root, 'palette', s.palette !== 'azul' ? s.palette : null);
    this.toggle(root, 'cb', s.colorBlind !== 'ninguno' ? s.colorBlind : null);
    this.toggle(root, 'motion', s.reduceMotion ? 'reduce' : null);
  }

  private toggle(root: HTMLElement, key: string, value: string | null): void {
    if (value === null) delete root.dataset[key];
    else root.dataset[key] = value;
  }

  private load(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return sanitizeSettings(raw ? JSON.parse(raw) : null);
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._settings()));
    } catch {
      /* storage unavailable */
    }
  }
}
