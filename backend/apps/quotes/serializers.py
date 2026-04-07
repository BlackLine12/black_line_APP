from rest_framework import serializers

from .models import QuoteRequest
from apps.artists.models import TattooStyle


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


class ArtistMatchCardSerializer(serializers.Serializer):
    """
    Serializer de SALIDA: representa una "Tarjeta de Artista" en los
    resultados del matchmaking.

    Campos devueltos:
        - artist_id:        PK del perfil del artista.
        - artist_name:      Nombre completo del usuario vinculado.
        - city:             Ciudad del artista.
        - minimum_setup_fee: Tarifa minima de apertura de agujas.
        - estimated_price:  Precio estimado calculado por el motor matematico
                            directamente en SQL (annotate).
    """

    artist_id = serializers.IntegerField(
        source="id",
        help_text="ID del perfil del artista.",
    )
    artist_name = serializers.CharField(
        source="user__first_name",
        help_text="Nombre del artista.",
    )
    city = serializers.CharField(
        help_text="Ciudad del artista.",
    )
    minimum_setup_fee = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Tarifa minima de apertura de agujas.",
    )
    estimated_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Precio estimado calculado en SQL (tamano x tarifa x zona x color).",
    )
