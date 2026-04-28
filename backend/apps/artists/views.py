from django.db import transaction
from django.db.models import Max
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
        if request.user.user_type not in ('STUDIO', 'ADMIN'):
            return Response(
                {"detail": "Solo artistas pueden tener perfil."},
                status=status.HTTP_403_FORBIDDEN,
            )
        profile, created = ArtistProfile.objects.get_or_create(user=request.user)
        if request.method == "PATCH":
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="me/stats")
    def my_stats(self, request):
        """GET /api/artists/profiles/me/stats/"""
        from django.utils import timezone
        from apps.quotes.models import Appointment

        if request.user.user_type not in ("STUDIO", "ADMIN"):
            return Response(
                {"detail": "Solo artistas pueden acceder a estadísticas."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            profile = request.user.artist_profile
        except Exception:
            return Response(
                {"pending_appointments": 0, "upcoming_appointments": 0, "total_portfolio_images": 0}
            )

        now = timezone.now()
        pending = Appointment.objects.filter(artist=profile, status=Appointment.Status.PENDING).count()
        upcoming = Appointment.objects.filter(
            artist=profile, status=Appointment.Status.APPROVED, scheduled_at__gte=now
        ).count()
        portfolio_count = profile.portfolio_images.count()

        return Response(
            {
                "pending_appointments": pending,
                "upcoming_appointments": upcoming,
                "total_portfolio_images": portfolio_count,
            }
        )


class PortfolioImageViewSet(viewsets.ModelViewSet):
    """
    CRUD de imágenes del portafolio.
    - Sube imágenes con multipart/form-data.
    - Solo el artista dueño puede crear / eliminar.
    """

    serializer_class = PortfolioImageSerializer
    permission_classes = [IsArtistOwnerOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    pagination_class = None

    def get_queryset(self):
        return (
            PortfolioImage.objects.select_related("artist__user")
            .filter(artist__user=self.request.user)
            .order_by("-position", "-created_at", "-id")
        )

    def perform_create(self, serializer):
        profile, _ = ArtistProfile.objects.get_or_create(user=self.request.user)
        next_position = (
            PortfolioImage.objects.filter(artist=profile).aggregate(max_position=Max("position"))["max_position"]
            or 0
        ) + 1
        serializer.save(artist=profile, position=next_position)

    @action(detail=False, methods=["post"], url_path="reorder")
    def reorder(self, request):
        ordered_ids = request.data.get("ordered_ids", [])
        if not isinstance(ordered_ids, list):
            return Response(
                {"detail": "ordered_ids debe ser una lista."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        images = list(self.get_queryset().filter(id__in=ordered_ids))
        if len(images) != len(ordered_ids):
            return Response(
                {"detail": "Uno o más elementos no pertenecen al portafolio actual."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        image_map = {image.id: image for image in images}
        total = len(ordered_ids)

        with transaction.atomic():
            for index, image_id in enumerate(ordered_ids):
                image = image_map[image_id]
                image.position = total - index
                image.save(update_fields=["position"])

        return Response(self.get_serializer(self.get_queryset(), many=True).data)
