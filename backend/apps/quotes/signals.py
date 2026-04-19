from datetime import timedelta

from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from .models import Appointment, CalendarBlock


# ── Capturar estado anterior antes de guardar ─────────────────────────────

@receiver(pre_save, sender=Appointment)
def capture_previous_status(sender, instance, **kwargs):
    """Guarda el status previo en memoria para que post_save detecte cambios."""
    if instance.pk:
        try:
            instance._previous_status = Appointment.objects.get(pk=instance.pk).status
        except Appointment.DoesNotExist:
            instance._previous_status = None
    else:
        instance._previous_status = None


# ── Lógica post-guardado ──────────────────────────────────────────────────

@receiver(post_save, sender=Appointment)
def handle_appointment_saved(sender, instance, created, **kwargs):
    """
    Centraliza las reacciones a cambios en Appointment:
      - created=True       → nueva solicitud   → email al artista
      - PENDING→APPROVED   → cita aprobada     → bloqueo calendario + email al cliente
      - PENDING→REJECTED   → cita rechazada    → email al cliente
      - PENDING→COUNTER_OFFER → contraoferta   → email al cliente
      - COUNTER_OFFER→APPROVED → cliente aceptó → bloqueo calendario
    """
    from .emails import (
        send_nueva_solicitud,
        send_cita_aprobada,
        send_cita_rechazada,
        send_contraoferta,
    )

    prev = getattr(instance, "_previous_status", None)
    curr = instance.status

    # ── Nueva cita ────────────────────────────────────────────────────────
    if created:
        send_nueva_solicitud(instance)
        return

    # Sin cambio de estado → nada que hacer
    if prev == curr:
        return

    # ── Aprobada (desde PENDING o desde COUNTER_OFFER aceptada) ──────────
    if curr == Appointment.Status.APPROVED:
        _auto_block_calendar(instance)
        send_cita_aprobada(instance)
        return

    # ── Rechazada ─────────────────────────────────────────────────────────
    if curr == Appointment.Status.REJECTED:
        send_cita_rechazada(instance)
        return

    # ── Contraoferta del artista ──────────────────────────────────────────
    if curr == Appointment.Status.COUNTER_OFFER:
        send_contraoferta(instance)
        return


# ── Helper privado ────────────────────────────────────────────────────────

def _auto_block_calendar(appointment):
    """RN 2.6.3: Bloquea automáticamente el calendario al aprobar una cita."""
    CalendarBlock.objects.get_or_create(
        artist=appointment.artist,
        start_datetime=appointment.scheduled_at,
        defaults={
            "end_datetime": appointment.scheduled_at + timedelta(hours=4),
            "reason": f"Cita #{appointment.pk} – {appointment.client}",
        },
    )
