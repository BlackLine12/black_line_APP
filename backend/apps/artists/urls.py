from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TattooStyleViewSet, ArtistProfileViewSet, PortfolioImageViewSet, ArtistCityCountView

router = DefaultRouter()
router.register(r"styles", TattooStyleViewSet, basename="tattoo-style")
router.register(r"profiles", ArtistProfileViewSet, basename="artist-profile")
router.register(r"portfolio", PortfolioImageViewSet, basename="portfolio-image")

app_name = "artists"

urlpatterns = [
    path("", include(router.urls)),
    path("cities/", ArtistCityCountView.as_view(), name="artist-cities"),
]
