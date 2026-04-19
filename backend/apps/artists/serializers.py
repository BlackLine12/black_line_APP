from rest_framework import serializers
from .models import TattooStyle, ArtistProfile, PortfolioImage


class TattooStyleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TattooStyle
        fields = ["id", "name"]


class PortfolioImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioImage
        fields = ["id", "artist", "image", "description", "position", "created_at"]
        read_only_fields = ["id", "artist", "position", "created_at"]


class ArtistProfileSerializer(serializers.ModelSerializer):
    styles = TattooStyleSerializer(many=True, read_only=True)
    style_ids = serializers.PrimaryKeyRelatedField(
        queryset=TattooStyle.objects.all(),
        many=True,
        write_only=True,
        source="styles",
        required=False,
    )
    username = serializers.CharField(source="user.username", read_only=True)
    portfolio_images = PortfolioImageSerializer(many=True, read_only=True)

    class Meta:
        model = ArtistProfile
        fields = [
            "id",
            "user",
            "username",
            "bio",
            "city",
            "base_hourly_rate",
            "minimum_setup_fee",
            "styles",
            "style_ids",
            "portfolio_images",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]
