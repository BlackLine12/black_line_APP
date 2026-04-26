from django.conf import settings
from django.db import models


class TattooStyle(models.Model):
    """Estilo de tatuaje (ej. Realismo, Tradicional, Lettering)."""

    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre")

    class Meta:
        verbose_name = "Estilo de Tatuaje"
        verbose_name_plural = "Estilos de Tatuaje"
        ordering = ["name"]

    def __str__(self):
        return self.name


class ArtistProfile(models.Model):
    """Perfil extendido para usuarios de tipo STUDIO / tatuador."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="artist_profile",
        verbose_name="Usuario",
    )
    bio = models.TextField(blank=True, default="", verbose_name="Biografía")
    city = models.CharField(max_length=150, blank=True, default="", verbose_name="Ciudad")
    base_hourly_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Tarifa por Hora",
    )
    minimum_setup_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Tarifa Mínima (apertura de agujas)",
    )
    styles = models.ManyToManyField(
        TattooStyle,
        blank=True,
        related_name="artists",
        verbose_name="Estilos",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Actualizado")

    class Meta:
        verbose_name = "Perfil de Artista"
        verbose_name_plural = "Perfiles de Artistas"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Perfil de {self.user.username}"


class PortfolioImage(models.Model):
    """Imagen del portafolio de un artista."""

    artist = models.ForeignKey(
        ArtistProfile,
        on_delete=models.CASCADE,
        related_name="portfolio_images",
        verbose_name="Artista",
    )
    image = models.ImageField(
        upload_to="portfolio/%Y/%m/",
        verbose_name="Imagen",
    )
    description = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="Descripción",
    )
    position = models.PositiveIntegerField(default=0, verbose_name="Orden")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Subida")

    class Meta:
        verbose_name = "Imagen de Portafolio"
        verbose_name_plural = "Imágenes de Portafolio"
        ordering = ["-position", "-created_at"]

    def __str__(self):
        return f"Imagen #{self.pk} – {self.artist}"
