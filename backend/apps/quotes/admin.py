from django.contrib import admin

from .models import QuoteRequest, Appointment, HealthConsent, CalendarBlock


@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "client", "tattoo_style", "body_part", "size_cm", "is_color", "created_at")
    list_filter = ("tattoo_style", "body_part", "is_color")
    search_fields = ("client__username", "client__email")
    readonly_fields = ("created_at",)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("id", "client", "artist", "status", "scheduled_at", "created_at")
    list_filter = ("status",)
    search_fields = ("client__username", "client__email", "artist__user__username")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)


@admin.register(HealthConsent)
class HealthConsentAdmin(admin.ModelAdmin):
    list_display = ("id", "appointment", "terms_accepted", "created_at")
    list_filter = ("terms_accepted", "has_allergies", "has_chronic_disease", "is_pregnant")
    readonly_fields = ("created_at",)


@admin.register(CalendarBlock)
class CalendarBlockAdmin(admin.ModelAdmin):
    list_display = ("id", "artist", "start_datetime", "end_datetime", "reason", "created_at")
    list_filter = ("artist",)
    search_fields = ("artist__user__username",)
    readonly_fields = ("created_at",)
