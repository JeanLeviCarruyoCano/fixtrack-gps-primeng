# FixTrackGPS - Angular + PrimeNG

Aplicación de seguimiento GPS en tiempo real construida con **Angular 17** (standalone components + signals) y **PrimeNG 17** (tema `lara-light-blue`).

## Requisitos

- Node.js 18+ (probado con Node 24)
- npm 10+

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo
npm start
# o: npx ng serve --host 0.0.0.0 --port 4200

# 3. Abrir el navegador en
# http://localhost:4200/
```

## Build producción

```bash
npm run build
# salida en dist/fixtrack-gps/
```

## Estructura del proyecto

```
src/
├── index.html                          # Carga Leaflet CSS + fuente Inter
├── main.ts                             # Bootstrap standalone
├── styles.css                          # Tema PrimeNG + estilos globales + marcadores
└── app/
    ├── app.config.ts                   # Providers: provideAnimationsAsync + MessageService
    ├── app.component.ts                # Shell + p-toast
    ├── models/
    │   └── gps.model.ts                # Interfaz GpsDevice + datos demo (mx041, mex111, mx072, mx205)
    ├── services/
    │   ├── gps.service.ts              # Estado global con signals (selección, vista, menú, capa)
    │   └── map-command.service.ts      # Bus de comandos zoom/recenter
    └── components/
        ├── map/                        # Leaflet con tiles satelitales + marcadores custom
        ├── top-bar/                    # p-button + p-badge (menú + notificaciones)
        ├── side-menu/                  # p-sidebar + p-badge (drawer navegación)
        ├── gps-selector/               # p-dropdown con templates (status dot, velocidad)
        ├── bottom-panel/               # p-button + p-tooltip (6 acciones)
        ├── info-panel/                 # p-tabView + p-tag + p-button (panel derecho)
        └── map-controls/               # p-button + p-menu (zoom, capas, recenter)
```

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Angular 17.3 (standalone + signals + `viewChild`) |
| UI library | PrimeNG 17.18 (`lara-light-blue` theme) |
| Iconos | PrimeIcons 8 |
| Mapa | Leaflet 1.9 + tiles Esri World Imagery (satélite), CARTO Voyager (calles), OpenTopoMap (terreno) |
| Tipografía | Inter (Google Fonts) |
| Animaciones | `@angular/platform-browser/animations/async` |

## Componentes PrimeNG usados

- `p-button` (con `pButton` directive, `text`, `rounded`, `outlined`, `danger`)
- `p-badge` (`severity="danger"`)
- `p-sidebar` (con templates `header`/`content`/`footer`)
- `p-dropdown` (con `filter`, templates `selectedItem` e `item`)
- `p-tooltip` (directiva `pTooltip`)
- `p-menu` (`popup=true`, con `MenuItem[]` y `command`)
- `p-tabView` + `p-tabPanel` (con `header` template)
- `p-tag` (`severity` success/warning/danger)
- `p-toast` (con `MessageService` provider)
- `pRipple` (directiva)

## Funcionalidades

- Mapa satelital con 4 marcadores GPS (pin verde / azul para seleccionado + pulso animado)
- Click en marcador o dropdown para seleccionar → flyTo animado al dispositivo
- Panel inferior con dropdown azul "Sin GPS seleccionado" + 6 botones de acción
- Panel lateral derecho con tabs (Control / Posición / Trayecto / Dashcam / Informe / Geocerca)
- Drawer lateral con resumen de dispositivos y navegación
- Controles de mapa: zoom, recenter, cambio de capa (satélite/mapa/terreno)
- Barra de escala (km) en esquina inferior izquierda
- Responsive: panel derecho se oculta en pantallas < 720px

## Datos de prueba

Los 4 dispositivos están definidos en `src/app/models/gps.model.ts`:

| ID | Vehículo | Conductor | Estado |
|---|---|---|---|
| mx041 | Toyota Hilux 2022 | Carlos Méndez | Detenido |
| mex111 | Ford F-150 2021 | Ana Rojas | En línea (42 km/h) |
| mx072 | Chevrolet Silverado 2020 | Luis Torres | Sin señal |
| mx205 | Nissan NP300 2023 | María López | En línea (78 km/h) |

Para conectar con un backend real, reemplaza `GPS_DEVICES` en `gps.model.ts` por una llamada `HttpClient.get<GpsDevice[]>()` en `GpsService`.

## Personalización rápida

- **Tema oscuro**: en `src/styles.css`, cambia `lara-light-blue` por `lara-dark-blue` (o `arya-blue`)
- **Color primario azul**: sobreescrito en CSS de componentes (`#2563eb`) — búscalo y reemplázalo
- **Más dispositivos**: añade objetos al array `GPS_DEVICES` en `gps.model.ts`

## Licencia

Proyecto demo educativo. Libre uso.
