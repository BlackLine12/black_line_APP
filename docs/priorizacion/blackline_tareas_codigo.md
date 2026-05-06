# BlackLine — Tareas de Código

> Stack: Django REST + Angular 19 + PostgreSQL
> Leyenda: ✅ Listo · 🔴 Alta · 🟡 Media · 🔵 Baja · ⬜ No necesaria

---

## ✅ YA IMPLEMENTADO

| Ticket | Qué es |
|--------|--------|
| BL-23 | Modelo `ArtistProfile` |
| BL-24 | Modelo `TattooStyle` + M2M con artista |
| BL-25 | Modelo `PortfolioImage` |
| BL-26 | Modelos `Appointment` + `HealthConsent` + `CalendarBlock` |
| BL-74 | Migración final estilos |
| BL-5 | Endpoints perfil artista (`/api/artists/profiles/`, `/me/`) |
| BL-27 | Upload de portafolio con validación MIME y 5 MB |
| BL-29 | Endpoint matchmaking `GET /api/quotes/match/` |
| BL-30 | Algoritmo de cotización automática |
| BL-31 | CalendarBlock + validación de solapamiento |
| BL-73 | `PATCH /api/artists/profiles/me/` — tarifas y perfil |
| BL-86 | Match integración completa |
| BL-88 | Modelo `HealthConsent` con hemofilia y firma |
| BL-89 | Migración `HealthConsent` |
| BL-91 | Validaciones backend: solo CLIENT dueño, solo citas APPROVED |
| BL-93 | Máquina de estados PENDING→APPROVED/REJECTED/COUNTER_OFFER |
| BL-95 | Endpoint contraoferta de fecha/condiciones |
| BL-33 | Proyecto Angular 19 standalone |
| BL-34 | Tailwind + sistema de diseño BlackLine |
| BL-36 | Pantalla Login |
| BL-37 | Pantalla Registro |
| BL-70 | Selector de rol (tarjetas CLIENTE / ARTISTA) |
| BL-71 | Guards: `authGuard`, `roleGuard`, `noAuthGuard` |
| BL-6 | Cotizador 4 pasos (estilo, zona, tamaño, color) |
| BL-82 | Lógica de pasos con validación inline |
| BL-84 | Botón "Siguiente" bloqueado si paso inválido |
| BL-85 | Persistencia de cotización en `sessionStorage` |
| BL-40 | Vista de resultados Match con tarjetas de artistas |
| BL-79 | Drag-and-drop para subida de fotos de portafolio |
| BL-90 | Formulario de salud con firma digital (canvas) |

---

## ✅ COMPLETADO EN ESTA SESIÓN

| Ticket | Qué se hizo |
|--------|------------|
| BL-92  | ✅ Bandeja de solicitudes — Navbar links agregados, seeder mejorado con fotos demo |
| SEEDER | ✅ Corrección de bodypart inválido (MUÑECA→MANO) + carga de portafolio demo |
| NAVBAR | ✅ Links a `/studio/solicitudes` y `/client/cotizaciones` en desktop y mobile |

---

## 🔴 ALTA — Hacer ahora

### BL-41 · Servicio global de Toasts

**Archivo:** `src/app/shared/services/toast.service.ts`

```typescript
show(message: string, type: 'success' | 'error' | 'warning' | 'info', duration = 3000)
```

Overlay sin bloquear la UI. Usar en: login, cita creada, contraoferta enviada, errores de red.

---

## 🟡 MEDIA — Siguiente bloque

### BL-97 · Integrar FullCalendar

```bash
npm install @fullcalendar/angular @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

Vista base `timeGridWeek`, locale `es`, seleccionable. *Hacer antes de BL-96.*

---

### BL-96 · Calendario del artista con bloqueos manuales

**Ruta:** `/studio/calendario` — **Depende de:** BL-97

- Citas APPROVED como eventos no editables
- CalendarBlocks como bloques de tiempo bloqueado
- Botón "Bloquear fecha" → modal con `start_datetime`, `end_datetime`, `reason`
- Click en bloque → opción eliminar

---

### BL-100 · Historial con filtros

**Rutas:** `/client/historial` y `/studio/historial`

Lista paginada con filtros por estado y rango de fechas. Consumir `count / next / previous` del contrato API.

---

## 🔵 BAJA — Cuando haya tiempo

### BL-94 · Imágenes de referencia en tarjetas de solicitud

Thumbnail en tarjeta + modal de vista ampliada. *Requiere BL-92 terminado.*

---

### BL-52 · Pipeline CI/CD con GitHub Actions

Archivo `.github/workflows/ci.yml` con jobs de backend (pytest) y frontend (build + test).

---

### BL-72 · Tests unitarios de Guards

```typescript
describe('roleGuard', () => {
  it('CLIENT no accede a /studio/**')
  it('STUDIO no accede a /client/**')
  it('ADMIN pasa ambas rutas')
  it('sin sesión → /auth/login')
})
```

---

### BL-44 · Pruebas de integración Frontend↔Backend

Flujo: wizard → POST quote → match → POST appointment → sessionStorage persiste.

---

### BL-48 · Pruebas E2E (Cypress / Playwright)

5 flujos: registro → cotizar → agendar → artista aprueba → cliente firma consentimiento.

---

## ⬜ NO NECESARIA (esta fase)

| Ticket | Por qué no |
|--------|-----------|
| BL-28 | Cloudinary/S3 — FileSystemStorage suficiente para dev/staging |
| BL-45 | Índices parciales RunSQL — optimización post-launch |
| BL-87 | QA match vacío — el componente ya muestra estado vacío |

---

## Orden de trabajo

```
1. BL-92  → Bandeja solicitudes artista        ✅ COMPLETADO
2. BL-41  → Toasts                             🔴 ← EN PROGRESO
3. BL-97  → FullCalendar (instalar)            🟡
4. BL-96  → Calendario + bloqueos             🟡
5. BL-100 → Historial con filtros              🟡
6. BL-94  → Imágenes referencia               🔵
7. BL-52  → CI/CD                             🔵
8. BL-72  → Tests guards                       🔵
9. BL-44  → Tests integración                  🔵
10. BL-48 → Tests E2E                          🔵
```
