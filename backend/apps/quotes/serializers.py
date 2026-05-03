from rest_framework import serializers

from .models import QuoteRequest, Appointment, HealthConsent, CalendarBlock
from apps.artists.models import TattooStyle, ArtistProfile


class QuoteRequestSerializer(serializers.ModelSerializer):
    """Serializer estricto para la creacion de solicitudes de cotizacion."""

    # Read-only fields returned in the response
    style_name = serializers.CharField(source="tattoo_style.name", read_only=True)
    body_part_display = serializers.CharField(source="get_body_part_display", read_only=True)

    class Meta:
        model = QuoteRequest
        fields = [
            "id",
            "client",
            "tattoo_style",
            "style_name",
            "body_part",
            "body_part_display",
            "size_cm",
            "is_color",
            "created_at",
        ]
        read_only_fields = ["id", "client", "created_at"]

    def validate_size_cm(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "El tamano en centimetros debe ser un numero positivo."
            )
        return value


# ===========================================================================
# RF-2 - Serializers para Busqueda, Filtros y Matchmaking
# ===========================================================================


class MatchSearchSerializer(serializers.Serializer):
    """
    Serializer de ENTRADA: valida los parametros de busqueda enviados por
    el cliente para el motor de matchmaking.

    Parametros obligatorios:
        - city:         Ciudad donde busca al artista.
        - style_id:     ID del estilo de tatuaje deseado.
        - size_cm:      Tamano estimado del tatuaje en centimetros.
        - body_part:    Zona del cuerpo (usa las mismas choices de QuoteRequest).
        - is_color:     Indica si el tatuaje sera a color.

    Parametros opcionales:
        - max_price:    Presupuesto maximo del cliente (filtro post-calculo).
    """

    city = serializers.CharField(
        max_length=150,
        help_text="Ciudad donde busca al artista.",
    )
    style_id = serializers.PrimaryKeyRelatedField(
        queryset=TattooStyle.objects.all(),
        help_text="ID del estilo de tatuaje deseado.",
    )
    size_cm = serializers.IntegerField(
        min_value=1,
        help_text="Tamano estimado del tatuaje en cm.",
    )
    body_part = serializers.ChoiceField(
        choices=QuoteRequest.BodyPart.choices,
        help_text="Zona del cuerpo donde ira el tatuaje.",
    )
    is_color = serializers.BooleanField(
        help_text="El tatuaje sera a color?",
    )
    max_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        help_text="Presupuesto maximo del cliente (opcional).",
    )


# ===========================================================================
# RF-4 – Serializers para Citas (Appointment)
# ===========================================================================

class AppointmentReadSerializer(serializers.ModelSerializer):
    """Serializer de lectura con información expandida de cliente y artista."""
    client_name = serializers.SerializerMethodField()
    client_email = serializers.EmailField(source="client.email", read_only=True)
    artist_name = serializers.SerializerMethodField()
    artist_city = serializers.CharField(source="artist.city", read_only=True)
    artist_id = serializers.IntegerField(source="artist.id", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    has_health_consent = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            "id", "client_name", "client_email",
            "artist_id", "artist_name", "artist_city",
            "quote", "scheduled_at", "status", "status_display",
            "counter_offer_datetime", "counter_offer_note",
            "has_health_consent", "created_at", "updated_at",
        ]

    def get_client_name(self, obj):
        return obj.client.get_full_name() or obj.client.username

    def get_artist_name(self, obj):
        return obj.artist.user.get_full_name() or obj.artist.user.username

    def get_has_health_consent(self, obj):
        return hasattr(obj, "health_consent")


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer para que el cliente cree una nueva cita."""

    class Meta:
        model = Appointment
        fields = ["artist", "quote", "scheduled_at"]

    def validate_scheduled_at(self, value):
        from django.utils import timezone
        if value <= timezone.now():
            raise serializers.ValidationError(
                "La fecha de la cita debe ser en el futuro."
            )
        return value


class AppointmentStatusSerializer(serializers.Serializer):
    """Serializer para actualizar el estado de una cita."""
    status = serializers.ChoiceField(choices=Appointment.Status.choices)
    counter_offer_datetime = serializers.DateTimeField(required=False, allow_null=True)
    counter_offer_note = serializers.CharField(required=False, default="", allow_blank=True)

    def validate(self, data):
        if data["status"] == Appointment.Status.COUNTER_OFFER:
            if not data.get("counter_offer_datetime"):
                raise serializers.ValidationError(
                    {"counter_offer_datetime": "Requerido cuando el estado es COUNTER_OFFER."}
                )
        return data


# ===========================================================================
# RF-6 – Serializer para HealthConsent
# ===========================================================================

class HealthConsentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthConsent
        fields = [
            "id", "has_allergies", "allergies_detail",
            "has_chronic_disease", "chronic_disease_detail",
            "takes_medication", "medication_detail",
            "is_pregnant", "has_skin_condition", "skin_condition_detail",
            "has_hemophilia", "hemophilia_detail",
            "signature_data",
            "terms_accepted", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_terms_accepted(self, value):
        if not value:
            raise serializers.ValidationError(
                "Debe aceptar los términos y política de privacidad para continuar."
            )
        return value

    def validate_signature_data(self, value):
        if not value or not value.startswith("data:image/"):
            raise serializers.ValidationError(
                "La firma digital es obligatoria."
            )
        return value


# ===========================================================================
# RF-7 – Serializer para CalendarBlock
# ===========================================================================

class CalendarBlockSerializer(serializers.ModelSerializer):
    artist_name = serializers.SerializerMethodField()

    class Meta:
        model = CalendarBlock
        fields = ["id", "artist", "artist_name", "start_datetime", "end_datetime", "reason", "created_at"]
        read_only_fields = ["id", "artist", "created_at"]

    def get_artist_name(self, obj):
        return obj.artist.user.get_full_name() or obj.artist.user.username

    def validate(self, data):
        start = data.get("start_datetime")
        end = data.get("end_datetime")
        if start and end and start >= end:
            raise serializers.ValidationError(
                {"end_datetime": "La fecha de fin debe ser posterior a la de inicio."}
            )
        return data


class ArtistMatchCardSerializer(serializers.ModelSerializer):
    """
    Serializer de SALIDA: Tarjeta de artista en resultados de matchmaking.
    Incluye estilos, bio, thumbnail de portafolio y precio estimado (annotated).
    style_match indica si el artista domina el estilo exacto del quote.
    """

    artist_id = serializers.IntegerField(source="id")
    artist_name = serializers.SerializerMethodField()
    styles = serializers.SerializerMethodField()
    portfolio_thumbnail = serializers.SerializerMethodField()
    estimated_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    style_match = serializers.BooleanField(read_only=True)

    class Meta:
        model = ArtistProfile
        fields = [
            "artist_id", "artist_name", "city", "bio",
            "minimum_setup_fee", "estimated_price",
            "styles", "portfolio_thumbnail", "style_match",
        ]

    def get_artist_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_styles(self, obj):
        return [{"id": s.id, "name": s.name} for s in obj.styles.all()]

    def get_portfolio_thumbnail(self, obj):
        first = obj.portfolio_images.first()
        if not first:
            return None
        return first.image.url
