from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.artists.models import ArtistProfile, TattooStyle


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


# ---------------------------------------------------------------------------
# Appointment (Cita)
# ---------------------------------------------------------------------------

class Appointment(models.Model):
    """
    Cita formal entre un cliente y un artista tatuador.

    Ciclo de vida (máquina de estados):
        PENDING       → Creada por el cliente, esperando respuesta del artista.
        APPROVED      → El artista aceptó la cita tal como fue propuesta.
        REJECTED      → El artista rechazó la cita.
        COUNTER_OFFER → El artista propuso una fecha/condiciones alternativas.
    """

    class Status(models.TextChoices):
        PENDING      = "PENDING",      "Pendiente"
        APPROVED     = "APPROVED",     "Aprobada"
        REJECTED     = "REJECTED",     "Rechazada"
        COUNTER_OFFER = "COUNTER_OFFER", "Contraoferta"

    # ── Relaciones ────────────────────────────────────────────────────────
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="appointments",
        verbose_name="Cliente",
    )
    artist = models.ForeignKey(
        ArtistProfile,
        on_delete=models.CASCADE,
        related_name="appointments",
        verbose_name="Artista",
    )
    quote = models.ForeignKey(
        QuoteRequest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="appointments",
        verbose_name="Cotización de origen",
        help_text="Cotización a partir de la cual se generó esta cita.",
    )

    # ── Fecha y hora ──────────────────────────────────────────────────────
    scheduled_at = models.DateTimeField(
        verbose_name="Fecha y hora de la cita",
    )

    # ── Estado ────────────────────────────────────────────────────────────
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name="Estado",
    )

    # ── Contraoferta (se rellena solo cuando status = COUNTER_OFFER) ─────
    counter_offer_datetime = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha/hora propuesta en contraoferta",
    )
    counter_offer_note = models.TextField(
        blank=True,
        default="",
        verbose_name="Nota de contraoferta",
    )

    # ── Auditoría ─────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Actualizado")

    class Meta:
        verbose_name = "Cita"
        verbose_name_plural = "Citas"
        ordering = ["-scheduled_at"]

    def __str__(self):
        return (
            f"Cita #{self.pk} | {self.client} → {self.artist} "
            f"[{self.get_status_display()}] @ {self.scheduled_at:%d/%m/%Y %H:%M}"
        )


# ---------------------------------------------------------------------------
# HealthConsent (Cuestionario de Salud / Consentimiento Informado)
# ---------------------------------------------------------------------------

class HealthConsent(models.Model):
    """
    Cuestionario de salud y consentimiento informado asociado a una cita.

    Los campos booleanos reflejan las preguntas médicas obligatorias del SRS.
    El campo `terms_accepted` es obligatorio por la Ley LFPDPPP (México).
    """

    # ── Relación con la cita ──────────────────────────────────────────────
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name="health_consent",
        verbose_name="Cita",
    )

    # ── Preguntas médicas críticas ─────────────────────────────────────────
    has_allergies = models.BooleanField(
        default=False,
        verbose_name="¿Tiene alergias?",
    )
    allergies_detail = models.TextField(
        blank=True,
        default="",
        verbose_name="Descripción de alergias",
        help_text="Especificar si la respuesta anterior es Sí.",
    )
    has_chronic_disease = models.BooleanField(
        default=False,
        verbose_name="¿Padece enfermedad crónica?",
        help_text="Ej. diabetes, hipertensión, coagulopatías.",
    )
    chronic_disease_detail = models.TextField(
        blank=True,
        default="",
        verbose_name="Descripción de enfermedad crónica",
    )
    takes_medication = models.BooleanField(
        default=False,
        verbose_name="¿Toma medicamentos actualmente?",
        help_text="Incluye anticoagulantes, corticosteroides, etc.",
    )
    medication_detail = models.TextField(
        blank=True,
        default="",
        verbose_name="Descripción de medicamentos",
    )
    is_pregnant = models.BooleanField(
        default=False,
        verbose_name="¿Está embarazada o en período de lactancia?",
    )
    has_skin_condition = models.BooleanField(
        default=False,
        verbose_name="¿Tiene condiciones de piel?",
        help_text="Ej. psoriasis, queloide, dermatitis.",
    )
    skin_condition_detail = models.TextField(
        blank=True,
        default="",
        verbose_name="Descripción de condición de piel",
    )
    has_hemophilia = models.BooleanField(
        default=False,
        verbose_name="¿Tiene hemofilia u otro trastorno de coagulación?",
        help_text="Incluye hemofilia A, B, enfermedad de von Willebrand, etc.",
    )
    hemophilia_detail = models.TextField(
        blank=True,
        default="",
        verbose_name="Descripción del trastorno de coagulación",
    )

    # ── Firma digital ──────────────────────────────────────────────────────
    signature_data = models.TextField(
        default="",
        verbose_name="Firma digital (base64)",
        help_text="Imagen PNG de la firma del cliente codificada en base64.",
    )

    # ── Consentimiento legal (LFPDPPP) ────────────────────────────────────
    terms_accepted = models.BooleanField(
        default=False,
        verbose_name="Acepta términos y política de privacidad",
        help_text=(
            "El cliente declara haber leído y aceptado los términos del servicio "
            "y el aviso de privacidad conforme a la Ley LFPDPPP."
        ),
    )

    # ── Auditoría ─────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Registrado")

    class Meta:
        verbose_name = "Cuestionario de Salud"
        verbose_name_plural = "Cuestionarios de Salud"

    def __str__(self):
        return f"HealthConsent – Cita #{self.appointment_id} ({self.appointment.client})"


# ---------------------------------------------------------------------------
# CalendarBlock (Bloqueo de Calendario del Artista)
# ---------------------------------------------------------------------------

class CalendarBlock(models.Model):
    """
    Bloqueo de un rango de tiempo en la agenda del artista.

    Permite al artista marcar periodos de no disponibilidad
    (vacaciones, eventos, mantenimiento, etc.) para impedir
    que se agendes citas en esas franjas.
    """

    # ── Relación con el artista ───────────────────────────────────────────
    artist = models.ForeignKey(
        ArtistProfile,
        on_delete=models.CASCADE,
        related_name="calendar_blocks",
        verbose_name="Artista",
    )

    # ── Rango de tiempo bloqueado ─────────────────────────────────────────
    start_datetime = models.DateTimeField(
        verbose_name="Inicio del bloqueo",
    )
    end_datetime = models.DateTimeField(
        verbose_name="Fin del bloqueo",
    )

    # ── Motivo opcional ───────────────────────────────────────────────────
    reason = models.TextField(
        blank=True,
        default="",
        verbose_name="Motivo del bloqueo",
        help_text="Ej. vacaciones, evento privado, enfermedad.",
    )

    # ── Auditoría ─────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado")

    class Meta:
        verbose_name = "Bloqueo de Calendario"
        verbose_name_plural = "Bloqueos de Calendario"
        ordering = ["start_datetime"]

    def clean(self):
        """Valida que el rango de fechas sea coherente."""
        if self.start_datetime and self.end_datetime:
            if self.start_datetime >= self.end_datetime:
                raise ValidationError({
                    "end_datetime": "La fecha de fin debe ser posterior a la fecha de inicio."
                })

    def save(self, *args, **kwargs):
        """Fuerza la validación de modelo antes de persistir."""
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"Bloqueo [{self.artist}] "
            f"{self.start_datetime:%d/%m/%Y %H:%M} → {self.end_datetime:%d/%m/%Y %H:%M}"
        )
