"""
RF-2 - API de Busqueda, Filtros y Matchmaking
================================================

Este modulo contiene las vistas de la app "quotes":

1. "QuoteRequestCreateView"  - Crea una solicitud de cotizacion (ya existente).
2. "ArtistMatchView"         - Motor de matchmaking RF-2 (nuevo).

Decisiones de Arquitectura - Rendimiento (RNF-2)
-------------------------------------------------
Para cumplir con el requisito no funcional de tiempo de respuesta <= 2.5 s
todo el calculo del presupuesto estimado se compila en una unica consulta SQL
mediante el ORM de Django ("annotate", "F", "Value", "ExpressionWrapper",
"Case"/"When").  Esto evita:

    - Bucles "for" sobre QuerySets de Python.
    - Multiples round-trips a la base de datos.
    - Overhead de serializacion innecesario (valores ya calculados en SQL).

La formula de presupuesto estimado es:

    estimated_price = MAX(
        size_cm x base_hourly_rate x body_part_multiplier x color_multiplier,
        minimum_setup_fee
    )

Donde:
    - "body_part_multiplier" se mapea con "Case"/"When" segun la zona.
    - "color_multiplier" es 1.20 si es a color, 1.00 si es blanco-y-negro.
    - "Greatest" garantiza que el precio nunca sea inferior a la tarifa minima.
"""

from decimal import Decimal

from django.db.models import (
    F,
    Q,
    Value,
    Case,
    When,
    DecimalField,
    ExpressionWrapper,
)
from django.db.models.functions import Greatest, Concat

from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.artists.models import ArtistProfile
from .models import QuoteRequest
from .serializers import (
    QuoteRequestSerializer,
    MatchSearchSerializer,
    ArtistMatchCardSerializer,
)


# ===========================================================================
# Vista existente - Creacion de QuoteRequest
# ===========================================================================

class QuoteRequestCreateView(APIView):
    """Recibe el payload del wizard de cotizacion y crea un QuoteRequest."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = QuoteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(client=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ===========================================================================
# RF-2 - Motor de Matchmaking
# ===========================================================================

# ---------------------------------------------------------------------------
# Multiplicadores de negocio
# ---------------------------------------------------------------------------
# Estos multiplicadores representan reglas de negocio parametrizables.
# En produccion podrian provenir de una tabla de configuracion; aqui se
# declaran como constantes para mantener la logica en el ORM (sin bucles).

# 1) Multiplicadores por zona del cuerpo
#    Zonas sensibles o de dificil acceso tienen mayor coste de ejecucion.
BODY_PART_MULTIPLIERS: dict[str, Decimal] = {
    "BRAZO":      Decimal("1.00"),
    "ANTEBRAZO":  Decimal("1.00"),
    "PIERNA":     Decimal("1.10"),
    "HOMBRO":     Decimal("1.05"),
    "ESPALDA":    Decimal("1.30"),
    "PECHO":      Decimal("1.25"),
    "COSTILLAS":  Decimal("1.50"),   # Zona muy dolorosa -> mayor dificultad
    "CUELLO":     Decimal("1.40"),
    "MANO":       Decimal("1.35"),
    "PIE":        Decimal("1.35"),
}

# 2) Multiplicador por color
#    Si el tatuaje es a color, se incrementa un 20 % por la complejidad
#    adicional de mezclas de tinta y capas de saturacion.
COLOR_MULTIPLIER = Decimal("1.20")
BW_MULTIPLIER = Decimal("1.00")


class ArtistMatchView(APIView):
    """
    RF-2 - Endpoint de Busqueda, Filtros y Matchmaking

    GET /api/quotes/match/

    Recibe los criterios del cliente y devuelve una lista de "Tarjetas de
    Artista" con un presupuesto estimado calculado directamente en SQL
    para cumplir con el RNF-2 (<= 2.5 s de respuesta).

    --------------------------------------------------
    Parametros de consulta (query params)
    --------------------------------------------------
    - "city"        (str)  - Ciudad del artista.
    - "style_id"    (int)  - PK del estilo de tatuaje.
    - "size_cm"     (int)  - Tamano estimado en centimetros.
    - "body_part"   (str)  - Zona del cuerpo (opciones del modelo).
    - "is_color"    (bool) - A color?
    - "max_price"   (dec)  - (Opcional) Presupuesto maximo.

    --------------------------------------------------
    Respuesta exitosa (200)
    --------------------------------------------------
    {
        "count": 3,
        "filters_applied": {
            "city": "Monterrey",
            "style": "Realismo",
            "size_cm": 15,
            "body_part": "ESPALDA",
            "is_color": true,
            "max_price": null
        },
        "results": [
            {
                "artist_id": 7,
                "artist_name": "Carlos Perez",
                "city": "Monterrey",
                "minimum_setup_fee": "500.00",
                "estimated_price": "1170.00"
            }
        ]
    }
    """

    # Permitir acceso publico para que clientes no registrados
    # puedan explorar tatuadores - ajustar segun politica de negocio.
    permission_classes = [AllowAny]

    # -----------------------------------------------------------------
    #  GET - Busqueda y calculo de matchmaking
    # -----------------------------------------------------------------
    def get(self, request):
        # -- 1. Validar parametros de entrada --
        search_serializer = MatchSearchSerializer(data=request.query_params)
        search_serializer.is_valid(raise_exception=True)
        params = search_serializer.validated_data

        city: str = params["city"]
        style = params["style_id"]          # Instancia de TattooStyle
        size_cm: int = params["size_cm"]
        body_part: str = params["body_part"]
        is_color: bool = params["is_color"]
        max_price = params.get("max_price")  # Decimal | None

        # -- 2. Resolver multiplicadores --
        zone_mult = BODY_PART_MULTIPLIERS.get(body_part, Decimal("1.00"))
        clr_mult = COLOR_MULTIPLIER if is_color else BW_MULTIPLIER

        # -- 3. Construir la consulta ORM con annotate --
        #
        # >>> RENDIMIENTO (RNF-2) <<<
        # Todo el calculo se delega a PostgreSQL en UNA sola query:
        #   - Se evitan bucles for / list comprehensions.
        #   - Se evita instanciar modelos completos (usamos .values()).
        #   - Greatest() garantiza que el precio >= minimum_setup_fee.
        #
        # Formula SQL compilada:
        #   GREATEST(
        #       <size_cm> * base_hourly_rate * <zone_mult> * <clr_mult>,
        #       minimum_setup_fee
        #   )

        queryset = (
            ArtistProfile.objects
            # -- RN 2.6.2: Solo artistas con perfil completo y activos --
            .filter(
                # El usuario vinculado debe estar activo
                user__is_active=True,
                # Debe tener al menos la tarifa base configurada (> 0)
                base_hourly_rate__gt=0,
                # Debe tener tarifa minima configurada (> 0)
                minimum_setup_fee__gt=0,
            )
            # -- RN 2.6.2: Debe dominar al menos un estilo --
            # (la siguiente condicion tambien filtra por el estilo solicitado)
            .filter(styles=style)
            # -- RF-2: Filtro por ciudad --
            .filter(city__iexact=city)
            # -- ANNOTATE: Calcular el precio estimado en SQL --
            # ExpressionWrapper envuelve la expresion aritmetica y define
            # el output_field para que Django genere el CAST correcto.
            .annotate(
                estimated_price=Greatest(
                    ExpressionWrapper(
                        # size_cm (constante) x tarifa x zona x color
                        Value(size_cm, output_field=DecimalField())
                        * F("base_hourly_rate")
                        * Value(zone_mult, output_field=DecimalField())
                        * Value(clr_mult, output_field=DecimalField()),
                        output_field=DecimalField(max_digits=12, decimal_places=2),
                    ),
                    F("minimum_setup_fee"),
                    output_field=DecimalField(max_digits=12, decimal_places=2),
                ),
            )
        )

        # -- 4. Filtro de presupuesto maximo (opcional) --
        if max_price is not None:
            queryset = queryset.filter(estimated_price__lte=max_price)

        # -- 5. Ordenar por precio estimado ascendente --
        queryset = queryset.order_by("estimated_price")

        # -- 6. Proyeccion con .values() (evita instanciar modelos) --
        #    Recuperamos solo las columnas necesarias para la tarjeta.
        results = queryset.values(
            "id",
            "user__first_name",
            "city",
            "minimum_setup_fee",
            "estimated_price",
        )

        # -- 7. Serializar y responder --
        card_serializer = ArtistMatchCardSerializer(results, many=True)

        return Response(
            {
                "count": len(card_serializer.data),
                "filters_applied": {
                    "city": city,
                    "style": style.name,
                    "size_cm": size_cm,
                    "body_part": body_part,
                    "is_color": is_color,
                    "max_price": str(max_price) if max_price else None,
                },
                "results": card_serializer.data,
            },
            status=status.HTTP_200_OK,
        )
