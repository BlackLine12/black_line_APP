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
    BooleanField,
    F,
    Value,
    Case,
    When,
    DecimalField,
    ExpressionWrapper,
)
from django.db.models.functions import Greatest

from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.artists.models import ArtistProfile
from .models import QuoteRequest, Appointment, HealthConsent, CalendarBlock
from .serializers import (
    QuoteRequestSerializer,
    MatchSearchSerializer,
    ArtistMatchCardSerializer,
    AppointmentReadSerializer,
    AppointmentCreateSerializer,
    AppointmentStatusSerializer,
    HealthConsentSerializer,
    CalendarBlockSerializer,
)


# ===========================================================================
# Helpers de permisos
# ===========================================================================

def _get_appointment_or_403(pk, user):
    """Devuelve (appointment, None) o (None, Response de error)."""
    try:
        appt = Appointment.objects.select_related("client", "artist__user").get(pk=pk)
    except Appointment.DoesNotExist:
        return None, Response({"detail": "Cita no encontrada."}, status=status.HTTP_404_NOT_FOUND)

    if user.user_type == "CLIENT" and appt.client != user:
        return None, Response({"detail": "Sin acceso a esta cita."}, status=status.HTTP_403_FORBIDDEN)
    if user.user_type == "STUDIO" and appt.artist.user != user:
        return None, Response({"detail": "Sin acceso a esta cita."}, status=status.HTTP_403_FORBIDDEN)

    return appt, None


# ===========================================================================
# Vista existente - Creacion de QuoteRequest
# ===========================================================================

class QuoteRequestCreateView(APIView):
    """Recibe el payload del wizard de cotizacion y crea un QuoteRequest."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Lista las cotizaciones del cliente autenticado, más reciente primero."""
        quotes = (
            QuoteRequest.objects
            .filter(client=request.user)
            .select_related("tattoo_style")
            .order_by("-created_at")
        )
        serializer = QuoteRequestSerializer(quotes, many=True)
        return Response({"count": quotes.count(), "results": serializer.data})

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
                user__is_active=True,
                base_hourly_rate__gt=0,
                minimum_setup_fee__gt=0,
            )
            # -- Debe tener al menos un estilo registrado --
            .filter(styles__isnull=False)
            # -- RF-2: Filtro por ciudad --
            .filter(city__iexact=city)
            .distinct()
            # -- ANNOTATE: price + estilo exacto --
            .annotate(
                estimated_price=Greatest(
                    ExpressionWrapper(
                        Value(size_cm, output_field=DecimalField())
                        * F("base_hourly_rate")
                        * Value(zone_mult, output_field=DecimalField())
                        * Value(clr_mult, output_field=DecimalField()),
                        output_field=DecimalField(max_digits=12, decimal_places=2),
                    ),
                    F("minimum_setup_fee"),
                    output_field=DecimalField(max_digits=12, decimal_places=2),
                ),
                # Artistas que dominan el estilo exacto aparecen primero
                style_match=Case(
                    When(styles=style, then=Value(True)),
                    default=Value(False),
                    output_field=BooleanField(),
                ),
            )
        )

        # -- 4. Filtro de presupuesto maximo (opcional) --
        if max_price is not None:
            queryset = queryset.filter(estimated_price__lte=max_price)

        # -- 5. Especialistas del estilo solicitado primero, luego por precio --
        queryset = queryset.order_by("-style_match", "estimated_price")

        # -- 6. Prefetch relaciones para evitar N+1 queries --
        queryset = queryset.select_related("user").prefetch_related("styles", "portfolio_images")

        # -- 7. Serializar y responder --
        card_serializer = ArtistMatchCardSerializer(
            queryset, many=True, context={"request": request}
        )

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


# ===========================================================================
# RF-4 – API de Citas (Appointment)
# ===========================================================================

class AppointmentListCreateView(APIView):
    """
    GET  /api/quotes/appointments/  — Lista citas según rol del usuario.
    POST /api/quotes/appointments/  — Cliente crea una nueva cita.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.user_type == "CLIENT":
            qs = Appointment.objects.filter(client=user)
        elif user.user_type == "STUDIO":
            qs = Appointment.objects.filter(artist__user=user)
        else:
            qs = Appointment.objects.all()

        qs = qs.select_related("client", "artist__user").order_by("-created_at")
        return Response(AppointmentReadSerializer(qs, many=True).data)

    def post(self, request):
        if request.user.user_type != "CLIENT":
            return Response(
                {"detail": "Solo los clientes pueden crear citas."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = AppointmentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save(client=request.user)
        return Response(
            AppointmentReadSerializer(appointment).data,
            status=status.HTTP_201_CREATED,
        )


class AppointmentDetailView(APIView):
    """GET /api/quotes/appointments/<pk>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        appt, err = _get_appointment_or_403(pk, request.user)
        if err:
            return err
        return Response(AppointmentReadSerializer(appt).data)


class AppointmentStatusUpdateView(APIView):
    """
    PATCH /api/quotes/appointments/<pk>/status/
    Máquina de estados:
      PENDING       → APPROVED | REJECTED | COUNTER_OFFER  (artista)
      COUNTER_OFFER → APPROVED                              (cliente)
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            appt = Appointment.objects.select_related("client", "artist__user").get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({"detail": "Cita no encontrada."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        new_status = request.data.get("status")

        if appt.status == Appointment.Status.PENDING:
            if user.user_type != "STUDIO" or appt.artist.user != user:
                return Response(
                    {"detail": "Solo el artista asignado puede responder a esta cita."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif appt.status == Appointment.Status.COUNTER_OFFER:
            if user.user_type != "CLIENT" or appt.client != user:
                return Response(
                    {"detail": "Solo el cliente puede responder a la contraoferta."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            if new_status != Appointment.Status.APPROVED:
                return Response(
                    {"detail": "Desde COUNTER_OFFER solo puede pasar a APPROVED."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(
                {"detail": f"No se puede modificar una cita en estado '{appt.get_status_display()}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AppointmentStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        appt.status = data["status"]
        if data["status"] == Appointment.Status.COUNTER_OFFER:
            appt.counter_offer_datetime = data.get("counter_offer_datetime")
            appt.counter_offer_note = data.get("counter_offer_note", "")
        appt.save()

        return Response(AppointmentReadSerializer(appt).data)


# ===========================================================================
# RF-6 – Cuestionario de Salud (HealthConsent)
# ===========================================================================

class HealthConsentView(APIView):
    """
    GET  /api/quotes/appointments/<pk>/health-consent/  — Leer cuestionario.
    POST /api/quotes/appointments/<pk>/health-consent/  — Cliente llena el cuestionario.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        appt, err = _get_appointment_or_403(pk, request.user)
        if err:
            return err
        try:
            consent = appt.health_consent
        except HealthConsent.DoesNotExist:
            return Response(
                {"detail": "Cuestionario de salud no registrado para esta cita."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(HealthConsentSerializer(consent).data)

    def post(self, request, pk):
        if request.user.user_type != "CLIENT":
            return Response(
                {"detail": "Solo el cliente puede enviar el cuestionario de salud."},
                status=status.HTTP_403_FORBIDDEN,
            )
        appt, err = _get_appointment_or_403(pk, request.user)
        if err:
            return err

        if hasattr(appt, "health_consent"):
            return Response(
                {"detail": "Ya existe un cuestionario de salud para esta cita."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = HealthConsentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        consent = serializer.save(appointment=appt)
        return Response(HealthConsentSerializer(consent).data, status=status.HTTP_201_CREATED)


# ===========================================================================
# RF-7 – Bloqueos de Calendario (CalendarBlock)
# ===========================================================================

class CalendarBlockListCreateView(APIView):
    """
    GET  /api/quotes/calendar-blocks/  — Lista bloques del artista autenticado.
    POST /api/quotes/calendar-blocks/  — Artista crea un bloqueo manual.
    """
    permission_classes = [IsAuthenticated]

    def _get_artist(self, user):
        try:
            return user.artist_profile, None
        except ArtistProfile.DoesNotExist:
            return None, Response(
                {"detail": "Perfil de artista no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def get(self, request):
        if request.user.user_type == "ADMIN":
            qs = CalendarBlock.objects.select_related("artist__user").all()
        else:
            artist, err = self._get_artist(request.user)
            if err:
                return err
            qs = CalendarBlock.objects.filter(artist=artist)
        return Response(CalendarBlockSerializer(qs, many=True).data)

    def post(self, request):
        if request.user.user_type != "STUDIO":
            return Response(
                {"detail": "Solo los artistas pueden bloquear su calendario."},
                status=status.HTTP_403_FORBIDDEN,
            )
        artist, err = self._get_artist(request.user)
        if err:
            return err

        serializer = CalendarBlockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        block = serializer.save(artist=artist)
        return Response(CalendarBlockSerializer(block).data, status=status.HTTP_201_CREATED)


class CalendarBlockDeleteView(APIView):
    """DELETE /api/quotes/calendar-blocks/<pk>/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.user_type != "STUDIO":
            return Response(
                {"detail": "Solo los artistas pueden gestionar su calendario."},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            artist = request.user.artist_profile
        except ArtistProfile.DoesNotExist:
            return Response({"detail": "Perfil de artista no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        try:
            block = CalendarBlock.objects.get(pk=pk, artist=artist)
        except CalendarBlock.DoesNotExist:
            return Response({"detail": "Bloqueo no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        block.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
