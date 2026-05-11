# Demo Data Reference

Cargado con `python manage.py seed_demo --reset`.  
Contraseña para todos los usuarios: **`BlackLine2025!`**

---

## Artistas (STUDIO)

| Email | Username | Ciudad | Estilos | Tarifa/hr | Mínimo |
|-------|----------|--------|---------|-----------|--------|
| `carlos@blackline.mx` | `carlos_ink` | Guadalajara | Realismo, Blackwork, Geométrico | $180 | $600 |
| `ana@blackline.mx` | `ana_tinta` | Ciudad de México | Acuarela, Neo-Tradicional, Minimalista | $200 | $700 |

---

## Clientes (CLIENT)

| Email | Username | Nombre |
|-------|----------|--------|
| `sofia@demo.mx` | `sofia_cliente` | Sofía Ramírez |
| `miguel@demo.mx` | `miguel_demo` | Miguel Torres |
| `lucia@demo.mx` | `lucia_test` | Lucía Vega |

---

## Citas pre-cargadas

| Cliente | Artista | Estilo | Zona | Tamaño | Color | Estado |
|---------|---------|--------|------|--------|-------|--------|
| Sofía | Carlos Ink | Realismo | Brazo | 20 cm | No | **PENDING** |
| Miguel | Carlos Ink | Blackwork | Espalda | 35 cm | No | APPROVED |
| Lucía | Carlos Ink | Geométrico | Antebrazo | 12 cm | Sí | **COUNTER_OFFER** — nota: "Prefiero el sábado 20, tengo más tiempo para trabajar en detalle." |
| Sofía | Ana Tinta | Acuarela | Hombro | 18 cm | Sí | **PENDING** |
| Miguel | Ana Tinta | Minimalista | Mano | 5 cm | No | REJECTED |

---

## Estilos de tatuaje (cargados por migración `0002_seed_tattoo_styles.py`)

Acuarela, Biomecánico, Blackwork, Chicano, Geométrico, Japonés, Lettering, Minimalismo, Neo-Tradicional, New School, Old School, Realismo, Surrealismo, Tradicional, Tribal

> `seed_demo` agrega también "Minimalista" (variante distinta a "Minimalismo") — ambas coexisten en la DB.

---

## Comandos útiles

```bash
# Cargar datos desde cero
docker compose exec backend python manage.py seed_demo --reset

# Cargar sin borrar existentes
docker compose exec backend python manage.py seed_demo

# Ver emails en consola (backend en dev)
docker compose logs -f backend

# Shell Django para consultas rápidas
docker compose exec backend python manage.py shell -c "
from apps.users.models import User
from apps.quotes.models import Appointment
print('Usuarios:', User.objects.count())
print('Citas:', Appointment.objects.count())
"
```

---

## Flujo de testing sugerido

**Como artista (carlos@blackline.mx):**
1. `/studio/solicitudes` — ver las 3 citas, aprobar la PENDING de Sofía, probar contraoferta
2. `/studio/agenda` — verificar calendar blocks intactos
3. `/studio/dashboard` — stats actualizadas tras aprobar

**Como cliente (sofia@demo.mx):**
1. `/client/mis-citas` — ver el estado actualizado tras aprobación del artista
2. `/client/match` — buscar artistas en "Guadalajara" o "Ciudad de México"
3. `/client/cotizador` — crear nueva cotización y seguir flujo completo
