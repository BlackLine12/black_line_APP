# Pendientes de Documentación Técnica — BlackLine

> Complemento del documento `blackline-algoritmos-tecnicos.pdf` (Mayo 2026).
> Este archivo registra los algoritmos, flujos y decisiones de código que aún
> no tienen diagrama formal ni descripción detallada.

---

## Estado actual

| Algoritmo / Flujo | Documentado | Archivo |
|---|:---:|---|
| Precio canónico (fórmula + multiplicadores) | ✅ | `blackline-algoritmos-tecnicos.pdf §2` |
| Flujo Cotizador → Match → Cita | ✅ | `blackline-algoritmos-tecnicos.pdf §3` |
| Máquina de estados de Appointment | ✅ | `blackline-algoritmos-tecnicos.pdf §4` |
| Gestión de sesión JWT + renovación automática | ✅ | `blackline-algoritmos-tecnicos.pdf §5` |
| ERD de base de datos | ✅ | `blackline-algoritmos-tecnicos.pdf §6` |
| Normalización de ciudades (cities-mx.ts) | ✅ | `blackline-algoritmos-tecnicos.pdf §7` |
| Flujo de Contraoferta de Precio/Fecha (BL-95-RF-4) | ✅ | `blackline-algoritmos-tecnicos.pdf §8` |
| Validación de Solapamiento en CalendarBlock | ✅ | `blackline-algoritmos-tecnicos.pdf §9` |
| Pipeline OpenAPI → Tipos Angular | ✅ | `blackline-algoritmos-tecnicos.pdf §10` |
| Flujo de Cuestionario de Salud (HealthConsent) | ✅ | `blackline-algoritmos-tecnicos.pdf §11` |
| Algoritmo de Match (filtrado de artistas) | ✅ | `blackline-algoritmos-tecnicos.pdf §12` |
| Guards y Permisos por Rol (Angular) | ✅ | `blackline-algoritmos-tecnicos.pdf §13` |
| Permisos DRF en el Backend | ✅ | `blackline-algoritmos-tecnicos.pdf §14` |
| Cálculo del Rango de Precio en Frontend | ✅ | `blackline-algoritmos-tecnicos.pdf §15` |
| Índices de Base de Datos (Backlog de Performance) | ✅ | `blackline-algoritmos-tecnicos.pdf §16` |
| Endpoint GET /api/quotes/cities/ (Backlog UX) | ✅ | `blackline-algoritmos-tecnicos.pdf §17` |

---

## Algoritmos pendientes de documentar

> Todos los algoritmos listados anteriormente han sido documentados en la v2.0.0
> del PDF (`blackline-algoritmos-tecnicos.pdf`, Mayo 2026).

---

## Notas de arquitectura sin documentar

| Tema | Descripción | Prioridad |
|---|---|:---:|
| Estrategia de migraciones en producción | `--fake` vs `migrate`, orden de dependencias | Alta |
| Configuración CORS en producción | allowlist explícita, diferencia con desarrollo | Alta |
| Estructura de `sessionStorage` | Claves exactas, TTL implícito, qué pasa al abrir nueva pestaña | Media |
| Manejo de errores en Angular | Interceptor de errores, toast/snackbar, logging | Media |
| Configuración de Celery (si existe) | Broker Redis, tareas async, reintentos | Baja |
| `DEBUG=False` checklist | Diferencias de comportamiento entre dev y prod | Media |

---

## Cómo usar este archivo

1. Al implementar cualquier ítem de esta lista, genera el diagrama Mermaid correspondiente
   y agrégalo al PDF técnico (recompila `blackline-algoritmos-tecnicos.tex`).
2. Marca la fila en la tabla de "Estado actual" como ✅ con referencia al PDF actualizado.
3. Borra la sección pendiente de este archivo.

---

*Última actualización: Mayo 2026 · Versión PDF: 2.0.0 · Rama: BL-95-RF-4*
