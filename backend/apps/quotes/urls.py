"""
URLs de la app "quotes"
=========================

Endpoints registrados:
    POST  /api/quotes/              -> Crear solicitud de cotizacion.
    GET   /api/quotes/match/        -> RF-2 Motor de Matchmaking.
"""

from django.urls import path

from .views import QuoteRequestCreateView, ArtistMatchView

app_name = "quotes"

urlpatterns = [
    # Crear solicitud de cotizacion (POST)
    path("", QuoteRequestCreateView.as_view(), name="quote-create"),

    # RF-2: Busqueda, Filtros y Matchmaking (GET)
    path("match/", ArtistMatchView.as_view(), name="artist-match"),
]
