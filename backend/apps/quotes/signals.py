from datetime import timedelta

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Appointment, CalendarBlock


@receiver(post_save, sender=Appointment)
def block_calendar_on_approval(sender, instance, **kwargs):
    """RN 2.6.3: Al aprobar una cita, bloquear automáticamente el calendario del artista."""
    if instance.status != Appointment.Status.APPROVED:
        return

    CalendarBlock.objects.get_or_create(
        artist=instance.artist,
        start_datetime=instance.scheduled_at,
        defaults={
            "end_datetime": instance.scheduled_at + timedelta(hours=4),
            "reason": f"Cita #{instance.pk} – {instance.client}",
        },
    )
