"""
URLs de la app "quotes"
=========================

Endpoints registrados:
    POST   /api/quotes/                                  -> Crear solicitud de cotización.
    GET    /api/quotes/match/                            -> RF-2 Motor de Matchmaking.

    GET    /api/quotes/appointments/                     -> RF-4 Listar citas (por rol).
    POST   /api/quotes/appointments/                     -> RF-4 Crear cita (cliente).
    GET    /api/quotes/appointments/<pk>/                -> RF-4 Detalle de cita.
    PATCH  /api/quotes/appointments/<pk>/status/         -> RF-4 Cambiar estado (máquina de estados).
    GET    /api/quotes/appointments/<pk>/health-consent/ -> RF-6 Leer cuestionario de salud.
    POST   /api/quotes/appointments/<pk>/health-consent/ -> RF-6 Enviar cuestionario de salud.

    GET    /api/quotes/calendar-blocks/                  -> RF-7 Listar bloqueos del artista.
    POST   /api/quotes/calendar-blocks/                  -> RF-7 Crear bloqueo manual.
    DELETE /api/quotes/calendar-blocks/<pk>/             -> RF-7 Eliminar bloqueo.
"""

from django.urls import path

from .views import (
    QuoteRequestCreateView,
    ArtistMatchView,
    AppointmentListCreateView,
    AppointmentDetailView,
    AppointmentStatusUpdateView,
    HealthConsentView,
    CalendarBlockListCreateView,
    CalendarBlockDeleteView,
)

app_name = "quotes"

urlpatterns = [
    # RF-1: Crear solicitud de cotización
    path("", QuoteRequestCreateView.as_view(), name="quote-create"),

    # RF-2: Matchmaking
    path("match/", ArtistMatchView.as_view(), name="artist-match"),

    # RF-4: Citas
    path("appointments/", AppointmentListCreateView.as_view(), name="appointment-list-create"),
    path("appointments/<int:pk>/", AppointmentDetailView.as_view(), name="appointment-detail"),
    path("appointments/<int:pk>/status/", AppointmentStatusUpdateView.as_view(), name="appointment-status"),

    # RF-6: Cuestionario de salud
    path("appointments/<int:pk>/health-consent/", HealthConsentView.as_view(), name="health-consent"),

    # RF-7: Bloqueos de calendario
    path("calendar-blocks/", CalendarBlockListCreateView.as_view(), name="calendar-block-list-create"),
    path("calendar-blocks/<int:pk>/", CalendarBlockDeleteView.as_view(), name="calendar-block-delete"),
]
