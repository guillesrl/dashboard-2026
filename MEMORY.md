# Memoria del proyecto: dashboard-2026

## 2026-04-24 22:47
- **Tarea**: recomienda alguna mejora para este proyecto
- **Herramientas**: lectura de archivos
- **Resultado**: Basado en la estructura del proyecto, estas son mis recomendaciones:  1. Agregar husky + lint-staged para pre-commit hooks automáticos (lint + test antes de cada commit)  2. Agregar @vitejs/plugin-react con React Compiler (ya disponible) para optimización automática de re-renders sin useMemo/useCall

## 2026-04-25 16:19
- **Tarea**: Últimos cambios
- **Herramientas**: bash
- **Resultado**: Últimos 3 commits:  - 1df8feb: stats en scroll horizontal para mobile - b3057bf: 3 gráficos nuevos (OrdersByStatus, ReservationsVsOrders, TopDishes) + fix variable duplicada - 6306428: reemplazo useMemo por React.memo + fix resetForm  9 archivos modificados, +330 líneas. Los gráficos de analíticas s

## 2026-04-25 17:26
- **Tarea**: alguna mejora para este proyecto?
- **Herramientas**: lectura de archivos, búsqueda de contenido, bash, editor
- **Resultado**: Subido.

## 2026-05-01 19:45
- **Tarea**: Crees tu que hacer está mejora es necesario? Unificar el fetching de datos con React Query. Hoy solo SalesByHourChart lo
- **Herramientas**: lectura de archivos
- **Resultado**: Sí, es una mejora muy recomendable. Ahora mismo tienes:  - Auto-refresh manual cada 60s en Index.tsx (trae datos aunque no hayan cambiado) - Cache custom en ReservationsService con TTL de 5s y fetch locking (código extra que React Query resuelve nativamente) - MenuService y OrdersService sin cache, 

## 2026-05-01 19:53
- **Tarea**: Si
- **Herramientas**: todowrite, lectura de archivos, escritura de archivos, editor, bash
- **Resultado**: Subido.

## 2026-05-01 20:32
- **Tarea**: Vamos a implementarlo ahora
- **Herramientas**: lectura de archivos, editor, bash
- **Resultado**: Subido.

## 2026-05-01 21:07
- **Tarea**: Si
- **Herramientas**: búsqueda de contenido, búsqueda de archivos, escritura de archivos, editor, bash
- **Resultado**: Subido.

## 2026-05-01 21:40
- **Tarea**: Si
- **Herramientas**: bash, escritura de archivos, editor
- **Resultado**: Subido.

## 2026-05-01 23:42
- **Tarea**: Que tal está?: Agregar KPIs en la pagina de Analiticas. Hoy solo hay graficos. Tarjetas con: ticket promedio, plato estr
- **Herramientas**: lectura de archivos, editor
- **Resultado**: Se agregan 4 tarjetas KPI sobre los gráficos:  - Ticket promedio (ventas del mes / total pedidos) - Plato estrella (ítem más vendido del mes) - Hora pico (hora con más pedidos) - Tasa de cancelación (% del mes)  ¿Procedo?

## 2026-05-01 23:43
- **Tarea**: Si
- **Herramientas**: bash
- **Resultado**: Subido.

## 2026-05-02 08:30
- **Tarea**: No veo los kpis sobre los gráficos , está implementado?
- **Herramientas**: lectura de archivos
- **Resultado**: El código está implementado correctamente (líneas 55-107). Probablemente necesitas reiniciar el dev server o hacer un hard refresh (Ctrl+Shift+R) en el navegador para que cargue la nueva versión.

## 2026-05-02 08:36
- **Tarea**: #17 3.275 ✓ 46 modules transformed.
#17 3.277 x Build failed in 2.26s
#17 3.277 error during build:
#17 3.277 [vite:esbu
- **Herramientas**: lectura de archivos, editor, bash
- **Resultado**: Subido.

## 2026-05-02 08:46
- **Tarea**: 3 warnings found (use docker --debug to expand):
 - SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensit
- **Herramientas**: bash, lectura de archivos, editor
- **Resultado**: Subido.

## 2026-05-02 09:31
- **Tarea**: Los botones de agregar plato y agregar pedidos en modo móvil deben ser sin texto solo el +
- **Herramientas**: editor, bash
- **Resultado**: Subido.

## 2026-05-02 09:45
- **Tarea**: En la primer apertura de la web la página se queda en "cargando reservas"
- **Herramientas**: editor, búsqueda de contenido, bash
- **Resultado**: Subido.

## 2026-05-02 09:51
- **Tarea**: En modo móvil reduce el tamaño de los titulos
- **Herramientas**: editor, bash
- **Resultado**: Subido.

## 2026-05-02 09:58
- **Tarea**: Me he quedado sin conexión a internet y me apareció este mensaje: Unexpected Application Error!
Failed to fetch dynamica
- **Herramientas**: escritura de archivos, editor, bash
- **Resultado**: Subido.

## 2026-05-02 13:15
- **Tarea**: Actualiza el readme de la web con las nuevas tecnologías
- **Herramientas**: lectura de archivos, editor, bash
- **Resultado**: Subido.
