# Informe de métricas de usabilidad de la UI — FixTrack GPS

> Plantilla. Los resultados deben completarse con los datos exportados desde `/usabilidad/resultados` (activar con `?usabilidad=1`). No se incluyen datos simulados.

## 1. Objetivo y alcance

- **Objetivo:** medir el efecto de las mejoras de UI de la Fase 1 (popup reducido, navegación única inferior, panel como hoja inferior de 3 alturas, contraste AA y estados con forma + color) sobre la usabilidad de la app.
- **Alcance:** tareas T1–T4 definidas en `src/app/usability/usability-tasks.config.ts`; mapa, selector de vehículo, hoja de detalle y barra inferior.
- **Fuera de alcance:** tamaños de botones y objetivos táctiles.

## 2. Metodología

| Aspecto | Valor |
|---|---|
| Fecha de la sesión | _por completar_ |
| Nº de participantes | _por completar_ (IDs anónimos P01, P02…) |
| Perfil de participantes | _por completar_ |
| Dispositivo(s) | _por completar (móvil / escritorio, modelo)_ |
| Navegador y versión | _por completar_ |
| Tamaño de pantalla | _por completar_ |
| Moderador | _por completar_ |

**Tareas**

| Id | Instrucción | Primer control esperado | Tiempo objetivo |
|---|---|---|---|
| T1 | Seleccionar el vehículo indicado e indicar si está en movimiento, detenido o sin señal | Ver config | 45 s |
| T2 | Consultar la última actualización o la velocidad | Ver config | 45 s |
| T3 | Abrir el Trayecto del vehículo | Ver config | 90 s |
| T4 | Consultar una alerta de Geocerca / Informe | Ver config | — |

**Procedimiento:** el moderador usa la pestaña «Moderador» para iniciar/finalizar tareas, marcar el resultado (sin ayuda / con ayuda / abandonó) y registrar errores (tipo y gravedad). Al terminar las 4 tareas se muestra el cuestionario SUS. Todos los datos quedan en `localStorage` del navegador.

## 3. Métricas

### 3.1 Tasa de éxito de tareas

- **Qué mide:** (tareas completadas sin ayuda / intentos totales) × 100.
- **Dónde se midió:** resultado marcado por el moderador + condición de éxito de cada tarea (vista de resultados, sección de tasa de éxito).
- **Meta:** ≥ 90 %.
- **Resultado:** _por completar_ (fuente: `/usabilidad/resultados` o resumen Markdown exportado).
- **Interpretación:** _por completar_.
- **Mejora propuesta:** _por completar_.

### 3.2 Tiempo para completar una tarea

- **Qué mide:** segundos entre inicio y fin de tarea; se reportan mediana y promedio (intentos abandonados excluidos).
- **Dónde se midió:** vista de resultados, tabla de tiempos por tarea.
- **Meta:** T1 ≤ 45 s; T3 ≤ 90 s.

| Tarea | Mediana (s) | Promedio (s) | Meta (s) | ¿Cumple? |
|---|---|---|---|---|
| T1 | _por completar_ | _por completar_ | 45 | _por completar_ |
| T2 | _por completar_ | _por completar_ | 45 | _por completar_ |
| T3 | _por completar_ | _por completar_ | 90 | _por completar_ |
| T4 | _por completar_ | _por completar_ | — | — |

- **Interpretación:** _por completar_.
- **Mejora propuesta:** _por completar_.

### 3.3 Tasa de errores de interacción

- **Qué mide:** % de intentos con al menos un error crítico (vehículo/dato equivocado, filtro incorrecto, confusión de estado, acciones repetidas sin respuesta clara). Se registran tipo y gravedad.
- **Dónde se midió:** errores marcados por el moderador (vista de resultados, errores por tipo y gravedad).
- **Meta:** < 10 % de intentos con error crítico.
- **Resultado:** _por completar_ (críticos: _x_, menores: _y_; por tipo: _por completar_).
- **Interpretación:** _por completar_.
- **Mejora propuesta:** _por completar_.

### 3.4 Éxito de la primera interacción

- **Qué mide:** % de tareas cuyo primer clic/toque va al control esperado (`data-track`).
- **Dónde se midió:** registro automático de clics (exportación CSV/JSON, eventos de clic y primera interacción).
- **Meta:** ≥ 80 %.
- **Resultado:** _por completar_.
- **Interpretación:** _por completar_ (controles equivocados más frecuentes: _por completar_).
- **Mejora propuesta:** _por completar_.

### 3.5 Puntuación SUS

- **Qué mide:** percepción global de usabilidad (10 ítems, escala 1–5). Ítems impares: valor − 1; pares: 5 − valor; suma × 2,5.
- **Dónde se midió:** cuestionario mostrado al finalizar las tareas (vista de resultados, tabla SUS).
- **Meta:** > 75.

| Participante | SUS |
|---|---|
| _por completar_ | _por completar_ |
| **Promedio** | _por completar_ |

- **Interpretación:** _por completar_.
- **Mejora propuesta:** _por completar_.

## 4. Hallazgos priorizados

| # | Hallazgo | Evidencia (métrica / export) | Gravedad | Mejora sugerida |
|---|---|---|---|---|
| 1 | _por completar_ | _por completar_ | _por completar_ | _por completar_ |

## 5. Conclusiones y siguientes pasos

- **Conclusiones:** _por completar_.
- **Siguientes pasos:** _por completar_ (re-test tras cambios, ajustar metas, ampliar muestra).

## Anexo: exportaciones

- Datos crudos: CSV/JSON desde `/usabilidad/resultados`.
- Resumen: Markdown desde la misma vista; pegar los valores en las secciones anteriores.
