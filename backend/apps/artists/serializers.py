from rest_framework import serializers
from .models import TattooStyle, ArtistProfile, PortfolioImage


class TattooStyleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TattooStyle
        fields = ["id", "name"]


class AdminArtistSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    styles = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = ArtistProfile
        fields = [
            "id",
            "user_id",
            "first_name",
            "last_name",
            "email",
            "username",
            "phone",
            "is_active",
            "city",
            "bio",
            "base_hourly_rate",
            "minimum_setup_fee",
            "profile_photo",
            "styles",
            "created_at",
        ]
        read_only_fields = fields


class PortfolioImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        if not obj.image:
            return None
        try:
            return obj.image.url
        except Exception:
            return None

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
    profile_photo = serializers.SerializerMethodField()

    def get_profile_photo(self, obj):
        if not obj.profile_photo:
            return None
        try:
            return obj.profile_photo.url
        except Exception:
            return None

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
            "profile_photo",
            "styles",
            "style_ids",
            "portfolio_images",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "profile_photo", "created_at", "updated_at"]
