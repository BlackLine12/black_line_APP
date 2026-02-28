from rest_framework import serializers

from .models import QuoteRequest


class QuoteRequestSerializer(serializers.ModelSerializer):
    """Serializer estricto para la creación de solicitudes de cotización."""

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
                "El tamaño en centímetros debe ser un número positivo."
            )
        return value
