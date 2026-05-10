# Mapa de algoritmos principales del proyecto BlackLine

Este documento organiza los algoritmos y flujos centrales para usarlo como base de diagrama.

## Convención de rutas
- Todas las rutas son relativas a la raíz del repo.
- Stack: Django REST (backend) + Angular (frontend).

## 1) Autenticación y sesión (núcleo de seguridad)

| Algoritmo / Flujo | Qué hace | Ruta relativa principal |
|---|---|---|
| Login por email o username | Busca usuario por email o username, valida contraseña y genera JWT | `backend/apps/users/serializers.py` |
| Endpoint de login JWT personalizado | Expone login usando serializer personalizado | `backend/apps/users/views.py` |
| Refresh de token | Renueva access token cuando expira | `backend/apps/users/urls.py` |
| Logout con blacklist | Invalida refresh token al cerrar sesión | `backend/apps/users/views.py` |
| Persistencia de sesión frontend | Guarda tokens y usuario en localStorage + estado reactivo | `frontend/src/app/core/services/auth.service.ts` |
| Refresh automático en cliente | Interceptor detecta 401, refresca token y reintenta request | `frontend/src/app/core/interceptors/jwt.interceptor.ts` |

## 2) Registro y gestión de usuario

| Algoritmo / Flujo | Qué hace | Ruta relativa principal |
|---|---|---|
| Registro con reglas de negocio | Impide alta como ADMIN y valida confirmación de contraseña | `backend/apps/users/serializers.py` |
| Creación de usuario | Crea usuario con tipo y datos iniciales | `backend/apps/users/serializers.py` |
| Perfil del usuario autenticado | Recupera el perfil actual | `backend/apps/users/views.py` |
| Cambio de contraseña | Verifica contraseña actual y actualiza la nueva | `backend/apps/users/serializers.py` |

## 3) Autorización por rol y acceso a rutas

| Algoritmo / Flujo | Qué hace | Ruta relativa principal |
|---|---|---|
| Guard de autenticación | Permite navegación solo si hay sesión | `frontend/src/app/core/guards/auth.guard.ts` |
| Guard de rol | Valida rol permitido y redirige según tipo de usuario | `frontend/src/app/core/guards/role.guard.ts` |
| Orquestación de rutas frontend | Aplica guards a módulos client y studio | `frontend/src/app/app.routes.ts` |
| Permisos backend de artista | Lectura autenticada y escritura solo dueño (o rol permitido) | `backend/apps/artists/permissions.py` |

## 4) Flujo de cotización (cliente)

| Algoritmo / Flujo | Qué hace | Ruta relativa principal |
|---|---|---|
| Wizard por pasos del cotizador | Avanza/retrocede pasos con validación por etapa | `frontend/src/app/features/client/pages/cotizador.component.ts` |
| Cálculo de etiqueta de tamaño | Convierte cm en categoría textual (pequeño, mediano, etc.) | `frontend/src/app/features/client/pages/cotizador.component.ts` |
| Submit de cotización | Construye payload y crea solicitud en backend | `frontend/src/app/features/client/pages/cotizador.component.ts` |
| API de cotización | Recibe payload y crea QuoteRequest con client autenticado | `backend/apps/quotes/views.py` |
| Validación de tamaño | Rechaza tamaños no positivos | `backend/apps/quotes/serializers.py` |

## 5) Flujo de estudio/artista (perfil y portafolio)

| Algoritmo / Flujo | Qué hace | Ruta relativa principal |
|---|---|---|
| Endpoint me del artista | Obtiene/crea perfil propio y permite PATCH | `backend/apps/artists/views.py` |
| Update de perfil de studio | Carga datos, arma payload con estilos y actualiza perfil | `frontend/src/app/features/studio/pages/dashboard.component.ts` |
| Selección de estilos | Alterna estilos con Set para estado local | `frontend/src/app/features/studio/pages/dashboard.component.ts` |
| Queryset de portafolio por dueño | Solo devuelve imágenes del artista autenticado | `backend/apps/artists/views.py` |
| Subida de portafolio | Envía multipart/form-data con imagen y descripción | `frontend/src/app/features/studio/services/artist.service.ts` |

## 6) Modelo de dominio (estructura base de datos)

| Algoritmo / Regla de dominio | Qué define | Ruta relativa principal |
|---|---|---|
| UserType y login por email | Tipos CLIENT/STUDIO/ADMIN + USERNAME_FIELD=email | `backend/apps/users/models.py` |
| QuoteRequest y BodyPart | Entidad de cotización, enum de zonas y tamaño positivo | `backend/apps/quotes/models.py` |
| ArtistProfile + estilos | Perfil extendido con relación M2M a TattooStyle | `backend/apps/artists/models.py` |
| PortfolioImage | Imágenes asociadas al perfil de artista | `backend/apps/artists/models.py` |

## 7) Punto de entrada y composición de APIs

| Algoritmo / Flujo | Qué hace | Ruta relativa principal |
|---|---|---|
| Enrutamiento raíz backend | Monta módulos auth, artists y quotes bajo /api | `backend/config/urls.py` |
| Rutas de auth | Define login, refresh, logout, register, profile | `backend/apps/users/urls.py` |
| Rutas de artists | Expone styles/profiles/portfolio por router DRF | `backend/apps/artists/urls.py` |
| Ruta de quotes | Expone creación de cotización | `backend/apps/quotes/urls.py` |

## Vista rápida para diagrama (bloques sugeridos)

1. Frontend
2. Guards y Session Layer
3. Interceptor JWT
4. API Gateway Django (urls.py)
5. Módulo Users (Auth)
6. Módulo Artists (Profiles/Portfolio)
7. Módulo Quotes (Wizard payload -> QuoteRequest)
8. PostgreSQL (User, ArtistProfile, TattooStyle, PortfolioImage, QuoteRequest)

## Nota
Si quieres, puedo generar en este mismo folder una versión adicional llamada `mapa-algoritmos-proyecto-excalidraw-ready.md` con formato de nodos y conexiones (A -> B -> C) para pegarlo directo a un flujo de Excalidraw.
