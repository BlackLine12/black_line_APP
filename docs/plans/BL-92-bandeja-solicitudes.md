# BL-92 — Bandeja de Solicitudes del Artista

**Prioridad:** 🔴 ALTA  
**Ruta:** `/studio/solicitudes`  
**Consume:** `GET /api/quotes/appointments/` · `PATCH /api/quotes/appointments/{id}/status/`

---

## Estado actual

### Lo que ya existe (reutilizable)
| Artefacto | Archivo | Qué aporta |
|-----------|---------|------------|
| `AgendaService` | `frontend/src/app/features/studio/services/agenda.service.ts` | `getAppointments()` y `updateStatus()` — ya funcionales |
| `Appointment` interface | `frontend/src/app/core/models/quote.ts` | Modelo base (falta datos de la cotización embebidos) |
| `AppointmentStatusPayload` | mismo archivo | Payload para aprobar/rechazar/contraofertar |
| `AppointmentReadSerializer` | `backend/apps/quotes/serializers.py:89` | Devuelve datos del cliente y artista, pero `quote` es solo un ID |
| Máquina de estados | `backend/apps/quotes/views.py` | PENDING→APPROVED\|REJECTED\|COUNTER_OFFER ya implementada |

### Gaps identificados

#### Backend (1 cambio)
- `AppointmentReadSerializer` devuelve `quote: number | null` (solo ID).  
  El artista necesita ver estilo, zona, tamaño y color sin hacer una segunda petición.  
  → **Agregar `QuoteDetailSerializer` anidado** en `AppointmentReadSerializer`.

#### Frontend (3 cambios)
1. `Appointment` interface — agregar campo `quote_detail` con los datos embebidos.
2. Nuevo componente `SolicitudesComponent` en `/studio/solicitudes` — bandeja dedicada, sin la sección de CalendarBlocks (esa es la `AgendaComponent` en `/studio/agenda`).
3. `studio.routes.ts` — registrar la ruta `solicitudes`.

---

## Contrato de datos (después del cambio)

```json
// GET /api/quotes/appointments/  (artista autenticado)
{
  "id": 12,
  "client_name": "Ana López",
  "client_email": "ana@mail.com",
  "artist_id": 3,
  "artist_name": "Carlos Ink",
  "artist_city": "Guadalajara",
  "quote": 8,
  "quote_detail": {
    "style_name": "Tradicional",
    "body_part_display": "Brazo",
    "size_cm": 15,
    "is_color": true
  },
  "estimated_price": "1350.00",
  "scheduled_at": "2026-05-20T14:00:00Z",
  "status": "PENDING",
  "status_display": "Pendiente",
  "counter_offer_datetime": null,
  "counter_offer_note": "",
  "has_health_consent": false,
  "created_at": "2026-05-05T10:00:00Z",
  "updated_at": "2026-05-05T10:00:00Z"
}
```

---

## Plan de implementación

### Paso 1 — Backend: serializer anidado

**Archivo:** `backend/apps/quotes/serializers.py`

Crear `QuoteDetailSerializer` (solo lectura, solo los campos que necesita el artista):

```python
class QuoteDetailSerializer(serializers.ModelSerializer):
    style_name = serializers.CharField(source="tattoo_style.name", read_only=True)
    body_part_display = serializers.CharField(source="get_body_part_display", read_only=True)

    class Meta:
        model = QuoteRequest
        fields = ["style_name", "body_part_display", "size_cm", "is_color"]
```

Actualizar `AppointmentReadSerializer`:
- Añadir campo `quote_detail = QuoteDetailSerializer(source="quote", read_only=True)`
- Añadir `estimated_price` calculado (SerializerMethodField que llame a la fórmula canónica del CLAUDE.md)
- Agregar `"quote_detail"` y `"estimated_price"` al `fields` list

**Fórmula canónica** (ya en `backend/apps/quotes/views.py` como `BODY_PART_MULTIPLIERS`):
```
estimated_price = MAX(
  size_cm × base_hourly_rate × zone_multiplier × color_multiplier,
  minimum_setup_fee
)
```

> Importar los multiplicadores desde `views.py` o extraerlos a `utils.py` compartido.

---

### Paso 2 — Frontend models

**Archivo:** `frontend/src/app/core/models/quote.ts`

```typescript
export interface AppointmentQuoteDetail {
  style_name: string;
  body_part_display: string;
  size_cm: number;
  is_color: boolean;
}

// En la interface Appointment existente, añadir:
quote_detail: AppointmentQuoteDetail | null;
estimated_price: string | null;
```

---

### Paso 3 — Frontend componente

**Archivo nuevo:** `frontend/src/app/features/studio/pages/solicitudes.component.ts`  
**Template:** `solicitudes.component.html`  
**Estilos:** `solicitudes.component.scss`

**Comportamiento:**
- `ngOnInit` → llama `agendaService.getAppointments()`, ordena: PENDING primero
- `filteredAppointments` computed por estado activo
- Tarjetas con datos del cliente + cotización (quote_detail + estimated_price)
- Botones según estado:
  - `PENDING` → [Aprobar] [Rechazar] [Contraofertar]
  - `COUNTER_OFFER` → solo lectura + badge "Esperando respuesta"
  - `APPROVED` / `REJECTED` → solo lectura + badge de estado
- Formulario inline de contraoferta (collapsable por cita):
  - `counter_offer_datetime` (datetime-local input)
  - `counter_offer_note` (textarea, max 500 chars)
- Feedback de acciones: mensajes inline por tarjeta (sin Toast global — BL-41 aún no existe)

**Diferencia con `AgendaComponent`:**  
`AgendaComponent` en `/studio/agenda` es el hub completo (citas + bloqueos de calendario).  
`SolicitudesComponent` en `/studio/solicitudes` es la bandeja enfocada solo en requests entrantes.

---

### Paso 4 — Routing

**Archivo:** `frontend/src/app/features/studio/pages/studio.routes.ts`

```typescript
{ path: 'solicitudes', component: SolicitudesComponent }
```

---

## Orden de ejecución

```
1. backend/apps/quotes/serializers.py  — QuoteDetailSerializer + campos en AppointmentReadSerializer
2. frontend/src/app/core/models/quote.ts — AppointmentQuoteDetail + campos en Appointment
3. frontend/.../solicitudes.component.ts|html|scss — componente nuevo
4. frontend/.../studio.routes.ts — registrar ruta
```

---

## Criterios de aceptación

- [ ] `GET /api/quotes/appointments/` devuelve `quote_detail` con estilo/zona/tamaño/color y `estimated_price`
- [ ] Ruta `/studio/solicitudes` carga sin errores (protegida por `roleGuard` existente)
- [ ] Citas PENDING muestran los 3 botones de acción
- [ ] Aprobar/Rechazar actualiza el estado en la tarjeta sin recargar la página
- [ ] Contraoferta valida que `counter_offer_datetime` esté presente antes de enviar
- [ ] Citas en COUNTER_OFFER, APPROVED, REJECTED se muestran en solo lectura
- [ ] `AgendaComponent` en `/studio/agenda` sigue funcionando sin cambios

---

## Dependencias

- **Antes de BL-94** (imágenes de referencia en tarjetas) — BL-94 extiende esta vista
- **No bloquea** BL-41 (Toasts) ni BL-97/96 (FullCalendar)
