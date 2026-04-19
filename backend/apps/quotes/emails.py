"""
RF-9 – Notificaciones por email para el flujo de citas.

Todos los envíos se despachan en un hilo secundario para no bloquear
el ciclo de request/signal. En producción reemplazar por Celery.
"""

import logging
import threading

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.timezone import localtime

logger = logging.getLogger(__name__)


# ── Helpers internos ──────────────────────────────────────────────────────

def _fmt_dt(dt) -> str:
    """Formatea un datetime al timezone del proyecto (es-MX)."""
    if dt is None:
        return "—"
    local = localtime(dt)
    return local.strftime("%-d de %B de %Y a las %H:%M")


def _send_async(subject: str, to: list[str], template: str, context: dict) -> None:
    """Renderiza la plantilla HTML y envía el correo en un hilo separado."""

    def _do_send():
        try:
            html_body = render_to_string(template, context)
            msg = EmailMultiAlternatives(
                subject=subject,
                body=_strip_html(html_body),
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=to,
            )
            msg.attach_alternative(html_body, "text/html")
            msg.send(fail_silently=False)
            logger.info("Email '%s' enviado a %s", subject, to)
        except Exception as exc:  # noqa: BLE001
            logger.error("Error al enviar email '%s' a %s: %s", subject, to, exc)

    threading.Thread(target=_do_send, daemon=True).start()


def _strip_html(html: str) -> str:
    """Versión plain-text muy básica como fallback."""
    import re
    return re.sub(r"<[^>]+>", "", html).strip()


def _frontend_url(path: str) -> str:
    base = getattr(settings, "FRONTEND_URL", "http://localhost:4200").rstrip("/")
    return f"{base}{path}"


# ── Funciones públicas ────────────────────────────────────────────────────

def send_nueva_solicitud(appointment) -> None:
    """
    RF-9: Notifica al artista que recibió una nueva solicitud de cita.
    Se dispara cuando el cliente crea un Appointment (status=PENDING).
    """
    artist_email = appointment.artist.user.email
    if not artist_email:
        return

    quote = appointment.quote
    context = {
        "artist_name":   appointment.artist.user.get_full_name() or appointment.artist.user.username,
        "client_name":   appointment.client.get_full_name() or appointment.client.username,
        "scheduled_at":  _fmt_dt(appointment.scheduled_at),
        "style_name":    quote.tattoo_style.name if quote else "",
        "dashboard_url": _frontend_url("/studio/dashboard"),
    }

    _send_async(
        subject="📬 Nueva solicitud de cita — BlackLine",
        to=[artist_email],
        template="quotes/emails/nueva_solicitud.html",
        context=context,
    )


def send_cita_aprobada(appointment) -> None:
    """
    RF-9: Notifica al cliente que su cita fue aprobada por el artista.
    Se dispara cuando el artista cambia status a APPROVED.
    """
    client_email = appointment.client.email
    if not client_email:
        return

    context = {
        "client_name":  appointment.client.get_full_name() or appointment.client.username,
        "artist_name":  appointment.artist.user.get_full_name() or appointment.artist.user.username,
        "artist_city":  appointment.artist.city,
        "scheduled_at": _fmt_dt(appointment.scheduled_at),
        "mis_citas_url": _frontend_url("/client/mis-citas"),
    }

    _send_async(
        subject="✦ ¡Tu cita fue aprobada! — BlackLine",
        to=[client_email],
        template="quotes/emails/cita_aprobada.html",
        context=context,
    )


def send_cita_rechazada(appointment) -> None:
    """
    RF-9: Notifica al cliente que su cita fue rechazada por el artista.
    Se dispara cuando el artista cambia status a REJECTED.
    """
    client_email = appointment.client.email
    if not client_email:
        return

    context = {
        "client_name":   appointment.client.get_full_name() or appointment.client.username,
        "artist_name":   appointment.artist.user.get_full_name() or appointment.artist.user.username,
        "scheduled_at":  _fmt_dt(appointment.scheduled_at),
        "cotizador_url": _frontend_url("/client/cotizador"),
    }

    _send_async(
        subject="Actualización sobre tu solicitud — BlackLine",
        to=[client_email],
        template="quotes/emails/cita_rechazada.html",
        context=context,
    )


def send_contraoferta(appointment) -> None:
    """
    RF-9: Notifica al cliente que el artista propone una fecha alternativa.
    Se dispara cuando el artista cambia status a COUNTER_OFFER.
    """
    client_email = appointment.client.email
    if not client_email:
        return

    context = {
        "client_name":            appointment.client.get_full_name() or appointment.client.username,
        "artist_name":            appointment.artist.user.get_full_name() or appointment.artist.user.username,
        "scheduled_at":           _fmt_dt(appointment.scheduled_at),
        "counter_offer_datetime": _fmt_dt(appointment.counter_offer_datetime),
        "counter_offer_note":     appointment.counter_offer_note or "",
        "mis_citas_url":          _frontend_url("/client/mis-citas"),
    }

    _send_async(
        subject="⟳ El artista propone una nueva fecha — BlackLine",
        to=[client_email],
        template="quotes/emails/contraoferta.html",
        context=context,
    )
