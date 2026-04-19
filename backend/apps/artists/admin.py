from django.contrib import admin
from .models import TattooStyle, ArtistProfile, PortfolioImage


@admin.register(TattooStyle)
class TattooStyleAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


class PortfolioImageInline(admin.TabularInline):
    model = PortfolioImage
    extra = 0
    fields = ("position", "image", "description", "created_at")
    readonly_fields = ("created_at",)


@admin.register(ArtistProfile)
class ArtistProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "city", "base_hourly_rate", "minimum_setup_fee", "created_at")
    list_filter = ("city", "styles")
    search_fields = ("user__username", "user__email", "city")
    inlines = [PortfolioImageInline]
    filter_horizontal = ("styles",)


@admin.register(PortfolioImage)
class PortfolioImageAdmin(admin.ModelAdmin):
    list_display = ("id", "artist", "position", "description", "created_at")
    list_editable = ("position",)
    list_filter = ("created_at",)
    search_fields = ("description", "artist__user__username")
    ordering = ("-position", "-created_at")
