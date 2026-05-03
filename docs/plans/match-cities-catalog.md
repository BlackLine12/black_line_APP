# Match — Catálogo de Ciudades MX + Mejora del Flujo de Búsqueda

**Estado:** IMPLEMENTADO  
**Fecha:** 2026-05-01  
**Área:** Frontend (Angular 19) + contrato con Backend (Django REST)

---

## Problema

El componente `MatchComponent` tenía un campo de texto libre para ingresar la ciudad del artista. Esto generaba dos problemas críticos:

1. **Inconsistencia de datos**: El artista guarda su ciudad como texto libre en `ArtistProfile.city`. Si el cliente escribe "guadalajara" y el artista tiene "Guadalajara" o "GDL", el match falla aunque el backend use `city__iexact`. Abreviaturas o variantes tipográficas no se normalizan.
2. **Mala UX**: El usuario no sabe qué ciudades tienen artistas disponibles. Un campo vacío es ambiguo.

---

## Solución implementada

### 1. Catálogo de ciudades (`cities-mx.ts`)

**Path:** `frontend/src/app/core/data/cities-mx.ts`

Se creó un catálogo con las ~90 ciudades más importantes de México, organizadas por estado. Cada entrada tiene:

```typescript
interface MexicanCity {
  name: string;   // nombre canónico para enviar al backend
  state: string;  // estado para mostrar en el dropdown (evita ambigüedad)
}
```

El catálogo es la **fuente de verdad** para los nombres de ciudad en el sistema. Tanto el cliente (búsqueda en Match) como el artista (configuración de perfil) deben usar este catálogo para garantizar coincidencias exactas.

### 2. Autocomplete en `MatchComponent`

El input de ciudad libre fue reemplazado por un autocomplete que:

- Filtra el catálogo mientras el usuario escribe (mínimo 1 carácter)
- Muestra nombre de ciudad + estado para evitar confusión (ej. "San Luis Potosí" puede ser ciudad o estado)
- Seleccionar una sugerencia establece el valor exacto del catálogo
- El botón Buscar queda deshabilitado hasta seleccionar una ciudad válida del catálogo
- Se cierra al hacer click fuera o al presionar Escape

---

## Contrato con Backend

El backend filtra con `city__iexact` (case-insensitive):
```python
.filter(city__iexact=city)
```

Por lo tanto, mientras el artista guarde "Guadalajara" y el cliente busque "Guadalajara" (del catálogo), el match funciona. La normalización del catálogo elimina el problema de variantes.

**Pendiente (mejora futura):** Agregar el mismo catálogo al formulario de perfil del artista (`StudioProfileComponent`) para garantizar que ambos extremos usen el mismo nombre canónico. Sin esto, si un artista guarda "GDL" manualmente, no aparecerá en búsquedas.

---

## Ciudades incluidas en el catálogo (por estado)

| Estado | Ciudades |
|--------|----------|
| Aguascalientes | Aguascalientes |
| Baja California | Tijuana, Mexicali, Ensenada, Tecate |
| Baja California Sur | La Paz, Los Cabos |
| Campeche | Campeche, Ciudad del Carmen |
| Chiapas | Tuxtla Gutiérrez, San Cristóbal de las Casas, Tapachula |
| Chihuahua | Chihuahua, Ciudad Juárez, Delicias, Cuauhtémoc, Parral |
| Ciudad de México | Ciudad de México |
| Coahuila | Saltillo, Torreón, Monclova, Piedras Negras |
| Colima | Colima, Manzanillo, Tecomán |
| Durango | Durango, Gómez Palacio |
| Estado de México | Toluca, Ecatepec, Naucalpan, Tlalnepantla, Texcoco |
| Guanajuato | Guanajuato, León, Irapuato, Celaya, Salamanca, San Miguel de Allende |
| Guerrero | Chilpancingo, Acapulco, Zihuatanejo, Taxco |
| Hidalgo | Pachuca, Tulancingo, Tula de Allende |
| Jalisco | Guadalajara, Zapopan, Tlaquepaque, Tonalá, Puerto Vallarta |
| Michoacán | Morelia, Zamora, Uruapan, Lázaro Cárdenas |
| Morelos | Cuernavaca, Jiutepec, Cuautla |
| Nayarit | Tepic, Bahía de Banderas |
| Nuevo León | Monterrey, Guadalupe, San Nicolás de los Garza, Apodaca, Santa Catarina |
| Oaxaca | Oaxaca de Juárez, Salina Cruz, Juchitán, Huatulco |
| Puebla | Puebla, Tehuacán, San Andrés Cholula, Atlixco |
| Querétaro | Querétaro, San Juan del Río |
| Quintana Roo | Cancún, Playa del Carmen, Chetumal, Tulum, Cozumel |
| San Luis Potosí | San Luis Potosí, Ciudad Valles, Matehuala |
| Sinaloa | Culiacán, Mazatlán, Los Mochis, Guasave |
| Sonora | Hermosillo, Ciudad Obregón, Nogales, Guaymas, San Luis Río Colorado |
| Tabasco | Villahermosa, Cárdenas |
| Tamaulipas | Tampico, Matamoros, Reynosa, Ciudad Victoria, Nuevo Laredo |
| Tlaxcala | Tlaxcala |
| Veracruz | Veracruz, Xalapa, Coatzacoalcos, Córdoba, Orizaba, Poza Rica |
| Yucatán | Mérida, Valladolid, Progreso |
| Zacatecas | Zacatecas, Fresnillo |

Total: ~90 ciudades.

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `frontend/src/app/core/data/cities-mx.ts` | **NUEVO** — catálogo de ciudades |
| `frontend/src/app/features/client/pages/match.component.ts` | Señales de autocomplete, lógica de filtrado |
| `frontend/src/app/features/client/pages/match.component.html` | Input reemplazado por autocomplete con dropdown |
| `frontend/src/app/features/client/pages/match.component.scss` | Estilos del dropdown autocomplete |

---

## Mejoras futuras (backlog)

- [ ] Aplicar el mismo catálogo en el perfil del artista (StudioProfileComponent)
- [ ] Agregar filtro por estado además de ciudad
- [ ] Endpoint `GET /api/quotes/cities/` que devuelva solo ciudades con artistas activos
- [ ] Caché del catálogo del backend para mostrar conteos de artistas por ciudad
