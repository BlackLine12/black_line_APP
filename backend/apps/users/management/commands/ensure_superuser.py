"""
Crea el superusuario de producción desde variables de entorno.
Idempotente: si ya existe, no hace nada.

Variables requeridas en Render:
    DJANGO_SUPERUSER_EMAIL
    DJANGO_SUPERUSER_PASSWORD
    DJANGO_SUPERUSER_USERNAME
"""
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Crea el superusuario desde variables de entorno (idempotente)"

    def handle(self, *args, **options):
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME")

        if not all([email, password, username]):
            self.stdout.write(
                self.style.WARNING(
                    "  [SKIP] ensure_superuser: "
                    "DJANGO_SUPERUSER_EMAIL / _PASSWORD / _USERNAME no definidas."
                )
            )
            return

        if User.objects.filter(email=email).exists():
            self.stdout.write(f"  [SKIP] Superusuario ya existe: {email}")
            return

        User.objects.create_superuser(
            email=email,
            username=username,
            password=password,
            first_name="Super",
            last_name="Admin",
            user_type="ADMIN",
        )
        self.stdout.write(self.style.SUCCESS(f"  [OK]   Superusuario creado: {email}"))
