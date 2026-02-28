from django.conf import settings
from django.db import models

from apps.artists.models import TattooStyle


class QuoteRequest(models.Model):
    """Solicitud de cotización creada por un cliente antes del match."""

    class BodyPart(models.TextChoices):
        BRAZO = "BRAZO", "Brazo"
        PIERNA = "PIERNA", "Pierna"
        ESPALDA = "ESPALDA", "Espalda"
        PECHO = "PECHO", "Pecho"
        COSTILLAS = "COSTILLAS", "Costillas"
        CUELLO = "CUELLO", "Cuello"
        MANO = "MANO", "Mano"
        PIE = "PIE", "Pie"
        HOMBRO = "HOMBRO", "Hombro"
        ANTEBRAZO = "ANTEBRAZO", "Antebrazo"

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quote_requests",
        verbose_name="Cliente",
    )
    tattoo_style = models.ForeignKey(
        TattooStyle,
        on_delete=models.PROTECT,
        related_name="quote_requests",
        verbose_name="Estilo de Tatuaje",
    )
    body_part = models.CharField(
        max_length=20,
        choices=BodyPart.choices,
        verbose_name="Zona del Cuerpo",
    )
    size_cm = models.PositiveIntegerField(
        verbose_name="Tamaño (cm)",
    )
    is_color = models.BooleanField(
        default=False,
        verbose_name="¿A color?",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado")

    class Meta:
        verbose_name = "Solicitud de Cotización"
        verbose_name_plural = "Solicitudes de Cotización"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Cotización #{self.pk} – {self.get_body_part_display()} ({self.tattoo_style})"
