import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessageModule } from 'primeng/message';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { GpsService } from '../services/gps.service';
import { StatusBadgeComponent } from '../shared/status';
import { GpsAlert } from '../models/gps.model';
import {
  AppSettings,
  ColorBlindMode,
  FontSize,
  Palette,
  SettingsService,
  ThemeMode,
} from './settings.service';
import { AppPanel, UiPanelService } from './ui-panel.service';

interface Choice<T> {
  value: T;
  label: string;
  hint?: string;
}

@Component({
  selector: 'app-panels',
  standalone: true,
  imports: [
    FormsModule,
    SharedModule,
    AccordionModule,
    ButtonModule,
    DialogModule,
    DividerModule,
    FieldsetModule,
    InputSwitchModule,
    MessageModule,
    RadioButtonModule,
    SelectButtonModule,
    TagModule,
    StatusBadgeComponent,
  ],
  templateUrl: './app-panels.component.html',
  styleUrl: './app-panels.component.scss',
})
export class AppPanelsComponent {
  readonly panels = inject(UiPanelService);
  readonly settingsService = inject(SettingsService);
  private readonly gps = inject(GpsService);

  readonly settings = this.settingsService.settings;
  readonly alerts = this.gps.alerts;
  readonly criticalCount = computed(() => this.alerts().filter((a) => a.severity === 'critica').length);

  readonly summaryText = computed(() => {
    const total = this.alerts().length;
    const critical = this.criticalCount();
    const base = `${total} ${total === 1 ? 'alerta activa' : 'alertas activas'}`;
    return critical > 0 ? `${base} · ${critical} ${critical === 1 ? 'crítica' : 'críticas'}` : base;
  });

  readonly fontSizes: Choice<FontSize>[] = [
    { value: 'pequeno', label: 'Pequeño (87 %)' },
    { value: 'normal', label: 'Normal (100 %)' },
    { value: 'grande', label: 'Grande (115 %)' },
    { value: 'muy-grande', label: 'Muy grande (130 %)' },
  ];

  readonly themes: Choice<ThemeMode>[] = [
    { value: 'claro', label: 'Claro', hint: 'Fondo claro (predeterminado)' },
    { value: 'oscuro', label: 'Oscuro', hint: 'Reduce el brillo y la fatiga visual' },
    { value: 'contraste', label: 'Alto contraste', hint: 'Texto negro, bordes marcados' },
    { value: 'sistema', label: 'Automático', hint: 'Sigue el tema del dispositivo' },
  ];

  readonly palettes: (Choice<Palette> & { swatch: string })[] = [
    { value: 'azul', label: 'Azul', swatch: '#2563eb' },
    { value: 'verde', label: 'Verde', swatch: '#047857' },
    { value: 'violeta', label: 'Violeta', swatch: '#7c3aed' },
    { value: 'naranja', label: 'Naranja', swatch: '#c2410c' },
    { value: 'rosa', label: 'Rosa', swatch: '#be185d' },
  ];

  readonly colorBlindModes: Choice<ColorBlindMode>[] = [
    { value: 'ninguno', label: 'Desactivado', hint: 'Colores estándar' },
    { value: 'protanopia', label: 'Protanopía', hint: 'Dificultad con el rojo' },
    { value: 'deuteranopia', label: 'Deuteranopía', hint: 'Dificultad con el verde' },
    { value: 'tritanopia', label: 'Tritanopía', hint: 'Dificultad con azul y amarillo' },
  ];

  readonly helpTopics = [
    {
      title: 'Seleccionar un vehículo',
      body: 'Toca un marcador del mapa o usa el selector inferior. El globo del mapa muestra solo el ID y la velocidad; el resto del detalle está en el panel inferior.',
    },
    {
      title: 'Moverte entre secciones',
      body: 'La barra inferior tiene seis secciones: Control, Posición, Trayecto, Dashcam, Informe y Geocerca. La sección activa aparece resaltada y subrayada.',
    },
    {
      title: 'Ajustar el panel inferior',
      body: 'Arrastra el asa (la barra gris del borde superior) para elegir entre colapsado, medio y completo. También puedes tocarla o usar las teclas Enter, Espacio y las flechas ↑ ↓ cuando está enfocada.',
    },
    {
      title: 'Alertas',
      body: 'Desde el menú, «Alertas» lista los vehículos sin señal, detenidos o con exceso de velocidad. Usa «Ver en el mapa» para ir directo al vehículo.',
    },
  ];

  readonly statusLegend = [
    { status: 'online' as const, text: 'Se desplaza con velocidad mayor a 0.' },
    { status: 'idle' as const, text: 'Encendido o estacionado sin moverse.' },
    { status: 'offline' as const, text: 'No reporta posición hace tiempo.' },
  ];

  isOpen(panel: AppPanel): boolean {
    return this.panels.open() === panel;
  }

  onVisibleChange(panel: AppPanel, visible: boolean): void {
    if (!visible && this.isOpen(panel)) this.panels.close();
  }

  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.settingsService.update(key, value);
  }

  reset(): void {
    this.settingsService.reset();
  }

  openSettings(): void {
    this.panels.show('settings');
  }

  showOnMap(alert: GpsAlert): void {
    this.gps.select(alert.deviceId);
    this.panels.close();
  }

  ago(date: Date): string {
    const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
    if (minutes < 1) return 'Hace instantes';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return hours < 24 ? `Hace ${hours} h` : `Hace ${Math.floor(hours / 24)} d`;
  }
}
