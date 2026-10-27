# SDD — Bazar Emprendedor en TIEMPO REAL (v8.0)

> Estado: implementado y verificado (cargo build + next build + smoke test SSE local).
> Rama objetivo: producción vía `scripts/deploy-bazar-realtime.sh` (o deploy completo `scripts/deploy_vps.sh`).

## 1. Objetivo

Actividad del Bazar (reservas, aprobaciones, votos, puestos, productos) visible en tiempo real
en todos los dispositivos abiertos, **sin polling pesado del frontend** y **sin exceder el VPS**
(1 GB RAM / 1 CPU / Ubuntu 24.04 con MariaDB + PHP-FPM + nginx + Rust ya en ejecución).

Decisión de arquitectura (vs. alternativas Go/servido aparte/long-polling): **SSE desde el
backend Rust existente** — cero procesos nuevos, ~0 MB de RAM adicional, un poller de 1 Hz.

## 2. Arquitectura (flujo de datos)

```
Acción usuario (PHP)
   backend/api/bazar.php | bazar-admin.php
        │  (dentro de la transacción/tras el COMMIT)
        ▼
   INSERT INTO bazar_eventos (tipo, payload)         ← BCM (Rust) no escribe aquí
        │
        ▼
Rust: modules/bazar_stream.rs
   start_poller() cada 1000 ms:
   "SELECT id, tipo, CAST(payload AS CHAR) ... WHERE id > ? ORDER BY id LIMIT 200"
        │  tokio::sync::broadcast::channel(256)
        ▼
GET /api/v1/bazar/events/stream   (text/event-stream)
        │  nginx: /api/v1/bazar/events/  (proxy_buffering off, read_timeout 1h)
        ▼
Frontend: EventSource (hooks en src/lib/bazarTema.ts)
   event: "bazar"  data: {id, tipo, payload}
   · BazarGrid.tsx        → refetch (throttle 1.2 s) + toast + anillo "¡NUEVO!"
   · AdminBazarDashboardTab.tsx → refetch de puestos/negocios/logs + toast
```

Fallback: si el `EventSource` no conecta (proxy viejo, red corporativa), el hook
`useBazarStream` detecta `onerror` tras ~10 s con estado `reconectando` y alterna a
polling REST cada 30 s (`action=eventos&since=...`). Reintenta SSE a los ~60 s.

## 3. Tabla `bazar_eventos` (migración v8.0)

```sql
CREATE TABLE IF NOT EXISTS bazar_eventos (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipo       VARCHAR(40)  NOT NULL,
  payload    JSON         NOT NULL,
  creado_en  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

* Purga: EVENT `ev_purga_bazar_eventos` diario 04:00, mantiene los 10 000 más recientes
  (requiere `event_scheduler = ON` — el deploy lo activa).
* Motor MySQL: MariaDB 10.x/11.x ignora silenciosamente `ENGINE=InnoDB` devolviendo Aria;
  aceptable (inserciones monótonas, no hay SELECT concurrente aparte del poller).

### Tipos de evento emitidos por PHP

| Evento | Emisor | Payload clave |
|---|---|---|
| `reserva_creada` | `action=registrar` | nombre, categoria, spot_id |
| `reserva_aprobada` | `verificar` / admin `aprobar` | nombre, folio, spot_id |
| `reserva_rechazada` | `rechazar` / admin | nombre, motivo |
| `voto_registrado` | `action=votar` | nombre, score |
| `producto_agregado` | `action=agregar_producto` | negocio, nombre |
| `logo_actualizado` | `action=subir_logo` | negocio |
| `edicion_creada` | admin `crear_edicion` | fecha, mapa |
| `edicion_archivada` | admin `archivar_edicion` | fecha |
| `puesto_asignado` | admin `asignar_puesto` | negocio, spot_id |
| `puesto_liberado` | admin `liberar_puesto` | negocio, spot_id |

`bazarEmitEvent()` (backend/lib/BazarEvents.php) **falla en silencio**: un error del bus
nunca rompe la operación principal del Bazar.

## 4. Backend PHP (canónico)

* `bazar.php`: rate limiting (`RateLimiter`: 6/hora usuario, 20/hora IP en `registrar`;
  8/hora en `subir_logo`), `action=subir_logo` (finfo MIME jpg/png/webp ≤ 2 MB; destino
  `/var/www/cesa-web/uploads/bazar/`, ruta relativa `uploads/bazar/filename`), y
  `action=eventos` para el fallback de polling (`since`, `limit`≤100).
  * Fix: alias `nombre_completo` del emprendedor y `logo_path`/`created_at` en los listados.
* `bazar-admin.php`: emite eventos de administración; `aprobar` sella
  `verificado_por`/`fecha_verificacion` (columnas nuevas en `emprendimientos`).
  ⚠️ Nota MariaDB: el ALTER de columnas no es idempotente (`ADD COLUMN IF NOT EXISTS`
  no existe); si la migración falla en esa línea, aplicar el `CREATE TABLE` y el EVENT
  aparte. El script de deploy usa `-f` (force-continue).

## 5. Backend Rust (SSE bus)

* `modules/bazar_stream.rs`:
  * `start_poller(pool, tx)`: arranca leyendo `MAX(id)` actual (no replay de histórico),
    consulta cada 1 s y `tx.send(ev)`.
  * Compatibilidad sqlx/MySQL: `CAST(MAX(id) AS SIGNED)`, `CAST(payload AS CHAR)`.
  * GET `/api/v1/bazar/events/stream`: `hello` inicial + eventos `bazar` + `lagged`
    (si el suscriptor pierde mensajes del canal).
* `state.rs`: `AppState.bazar_eventos: broadcast::Sender<BazarEvento>` (canal 256).
* `main.rs`: crea el canal, arranca el poller, mergea el router.
* `Cargo.toml`: `tokio-stream = "0.1"`.

## 6. Frontend

* `src/lib/bazarTema.ts`:
  * `useBazarStream(apiUrl, onEvento)`: EventSource + fallback polling; expone estado
    `conectado|reconectando|polling|fallback`.
  * `obtenerStreamUrl(apiUrl)`: deriva `…/api` → `…/api/v1/bazar/events/stream`
    (env opcional `NEXT_PUBLIC_STREAM_URL`).
  * `useBazarTema()`: paleta por calendario (Institucional, Patrio 1–17 sep, Octubre Rosa
    1–15 oct, Halloween 16–25 oct, Día de Muertos 26 oct–2 nov, Revolución 18–21 nov,
    Navidad 10 dic–6 ene, Amor 12–16 feb) + modo Día/Noche/Auto → variables CSS `--b-*`.
    Override del usuario en `localStorage` (`bazar_tema_override`, `bazar_modo`).
  * `textoEventoBazar()` / `iconoEventoBazar()`: textos de toasts.
* `globals.css`: `.bazar-toast`, `.bazar-sk` (skeleton), `.bazar-live-dot`, keyframes
  `bazar-nuevo-pulso` (anima el atributo `r` SVG), `bazar-glow`, `bazar-shimmer`.
* `BazarSchematicMap.tsx`: consume `--b-map-*` con fallbacks; prop `recientes`
  (anillo pulsante + badge "¡NUEVO!" ≤ 60 s).
* `BazarGrid.tsx`: toast no bloqueantes, panel "Mi Negocio" (logo, productos, ticket),
  `cpontacta→Contacta` fix, skeleton loaders, `registrar_vista` por sesión, badge NUEVO.
* `AdminBazarDashboardTab.tsx`: chip "EN VIVO", selector de tema y modo, refetch
  administrativo en eventos del bus.

## 7. nginx (SSE)

`location /api/v1/bazar/events/` **antes** del `location /api/v1/` genérico:
`proxy_buffering off; proxy_cache off; chunked_transfer_encoding off;
proxy_read_timeout 1h; proxy_set_header Connection ''; add_header X-Accel-Buffering no;`

## 8. Despliegue

```bash
bash scripts/deploy-bazar-realtime.sh    # excluye: migración + PHP + nginx + Rust + push estático
```

Asume `frontend/out` recién construido (lo hace el propio script con `npm run build`).
Deploy completo alternativo: `scripts/deploy_vps.sh` (incluye: v8.0, `uploads/bazar`
y `event_scheduler = ON`).

## 9. Verificación post-deploy

```bash
curl -N https://cesaunison.fondo…/api/v1/bazar/events/stream   # → event: hello
sudo pm2 logs cesa-rust --lines 20                              # poller activo
# En dos naves: registrar negocio en una → toast + pulso en la otra sin F5
```

## 10. Rollback

1. `git revert` de los archivos PHP/Rust/TSX y re-deploy.
2. El sistema degrada de forma segura: sin `bazar_eventos` el poller solo loggea
   warnings; el frontend vuelve a polling REST de siempre.
