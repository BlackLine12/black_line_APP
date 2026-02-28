from django.contrib import admin

from .models import QuoteRequest


@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "client", "tattoo_style", "body_part", "size_cm", "is_color", "created_at")
    list_filter = ("tattoo_style", "body_part", "is_color")
    search_fields = ("client__username", "client__email")
    readonly_fields = ("created_at",)
