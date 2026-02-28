from rest_framework import viewsets, permissions, status, parsers
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import TattooStyle, ArtistProfile, PortfolioImage
from .serializers import (
    TattooStyleSerializer,
    ArtistProfileSerializer,
    PortfolioImageSerializer,
)
from .permissions import IsArtistOwnerOrReadOnly


class TattooStyleViewSet(viewsets.ModelViewSet):
    """CRUD de estilos de tatuaje. Solo lectura para usuarios normales."""

    queryset = TattooStyle.objects.all()
    serializer_class = TattooStyleSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]


class ArtistProfileViewSet(viewsets.ModelViewSet):
    """
    CRUD del perfil de artista.
    - GET list/retrieve: cualquier usuario autenticado.
    - POST/PUT/PATCH/DELETE: solo el artista dueño.
    """

    queryset = ArtistProfile.objects.select_related("user").prefetch_related(
        "styles", "portfolio_images"
    )
    serializer_class = ArtistProfileSerializer
    permission_classes = [IsArtistOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get", "patch"], url_path="me")
    def me(self, request):
        """Endpoint de conveniencia: /api/artists/profiles/me/"""
        profile, created = ArtistProfile.objects.get_or_create(user=request.user)
        if request.method == "PATCH":
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class PortfolioImageViewSet(viewsets.ModelViewSet):
    """
    CRUD de imágenes del portafolio.
    - Sube imágenes con multipart/form-data.
    - Solo el artista dueño puede crear / eliminar.
    """

    serializer_class = PortfolioImageSerializer
    permission_classes = [IsArtistOwnerOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_queryset(self):
        return PortfolioImage.objects.select_related("artist__user").filter(
            artist__user=self.request.user
        )

    def perform_create(self, serializer):
        profile, _ = ArtistProfile.objects.get_or_create(user=self.request.user)
        serializer.save(artist=profile)
