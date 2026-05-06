"""
Comando de semilla para datos de demostración.
Uso: python manage.py seed_demo
     python manage.py seed_demo --reset   (borra y recrea todo)
"""
from decimal import Decimal
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand
from django.utils import timezone


STYLES = [
    "Realismo", "Tradicional", "Neo-Tradicional", "Blackwork",
    "Geométrico", "Lettering", "Acuarela", "Japonés", "Tribal", "Minimalista",
]

ARTISTS = [
    {
        "username": "carlos_ink",
        "email": "carlos@blackline.mx",
        "first_name": "Carlos",
        "last_name": "Mendoza",
        "city": "Guadalajara",
        "bio": "10 años tatuando en Guadalajara. Especialista en realismo y blackwork. Cada tatuaje es una historia que merece ser contada con precisión.",
        "base_hourly_rate": Decimal("180"),
        "minimum_setup_fee": Decimal("600"),
        "styles": ["Realismo", "Blackwork", "Geométrico"],
        "profile_photo": "artist-1.png",
        "portfolio_images": ["artist-1.png", "artist-2.png"],
    },
    {
        "username": "ana_tinta",
        "email": "ana@blackline.mx",
        "first_name": "Ana",
        "last_name": "Fuentes",
        "city": "Ciudad de México",
        "bio": "Artista tatuadora con enfoque en acuarela y neo-tradicional. Transformo tus ideas en arte permanente con colores vivos y trazo seguro.",
        "base_hourly_rate": Decimal("200"),
        "minimum_setup_fee": Decimal("700"),
        "styles": ["Acuarela", "Neo-Tradicional", "Minimalista"],
        "profile_photo": "artist-3.png",
        "portfolio_images": ["artist-3.png", "artist-4.png"],
    },
]

CLIENTS = [
    {"username": "sofia_cliente", "email": "sofia@demo.mx", "first_name": "Sofía", "last_name": "Ramírez"},
    {"username": "miguel_demo",   "email": "miguel@demo.mx", "first_name": "Miguel", "last_name": "Torres"},
    {"username": "lucia_test",    "email": "lucia@demo.mx",  "first_name": "Lucía",  "last_name": "Vega"},
]

APPOINTMENTS_TEMPLATE = [
    {
        "client_idx": 0,
        "artist_idx": 0,
        "style": "Realismo",
        "body_part": "BRAZO",
        "size_cm": 20,
        "is_color": False,
        "days_ahead": 10,
        "status": "PENDING",
    },
    {
        "client_idx": 1,
        "artist_idx": 0,
        "style": "Blackwork",
        "body_part": "ESPALDA",
        "size_cm": 35,
        "is_color": False,
        "days_ahead": 7,
        "status": "APPROVED",
    },
    {
        "client_idx": 2,
        "artist_idx": 0,
        "style": "Geométrico",
        "body_part": "ANTEBRAZO",
        "size_cm": 12,
        "is_color": True,
        "days_ahead": 15,
        "status": "COUNTER_OFFER",
        "counter_offer_days": 20,
        "counter_offer_note": "Prefiero el sábado 20, tengo más tiempo para trabajar en detalle.",
    },
    {
        "client_idx": 0,
        "artist_idx": 1,
        "style": "Acuarela",
        "body_part": "HOMBRO",
        "size_cm": 18,
        "is_color": True,
        "days_ahead": 14,
        "status": "PENDING",
    },
    {
        "client_idx": 1,
        "artist_idx": 1,
        "style": "Minimalista",
        "body_part": "MANO",
        "size_cm": 5,
        "is_color": False,
        "days_ahead": 5,
        "status": "REJECTED",
    },
]


class Command(BaseCommand):
    help = "Crea datos de demostración: artistas, clientes y citas en distintos estados."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Elimina los usuarios demo antes de recrearlos.",
        )

    def handle(self, *args, **options):
        from apps.users.models import User
        from apps.artists.models import TattooStyle, ArtistProfile, PortfolioImage
        from apps.quotes.models import QuoteRequest, Appointment

        repo_root = Path(settings.BASE_DIR).parent
        image_dir = repo_root / "frontend" / "public" / "images"

        if options["reset"]:
            demo_emails = [a["email"] for a in ARTISTS] + [c["email"] for c in CLIENTS]
            deleted, _ = User.objects.filter(email__in=demo_emails).delete()
            self.stdout.write(f"  Eliminados {deleted} usuarios demo previos.")

        # 1 ── TattooStyles
        style_map: dict[str, TattooStyle] = {}
        for name in STYLES:
            obj, created = TattooStyle.objects.get_or_create(name=name)
            style_map[name] = obj
        self.stdout.write(self.style.SUCCESS(f"✓ {len(STYLES)} estilos listos"))

        # 2 ── Artistas
        artist_profiles: list[ArtistProfile] = []
        for data in ARTISTS:
            user, created = User.objects.get_or_create(
                email=data["email"],
                defaults={
                    "username": data["username"],
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "user_type": "STUDIO",
                },
            )
            if created:
                user.set_password("BlackLine2025!")
                user.save()

            profile, _ = ArtistProfile.objects.get_or_create(user=user)
            profile.bio = data["bio"]
            profile.city = data["city"]
            profile.base_hourly_rate = data["base_hourly_rate"]
            profile.minimum_setup_fee = data["minimum_setup_fee"]
            profile.styles.set([style_map[s] for s in data["styles"]])
            profile.save()

            photo_name = data.get("profile_photo")
            if photo_name and not profile.profile_photo:
                photo_path = image_dir / photo_name
                if photo_path.exists():
                    with photo_path.open("rb") as file_obj:
                        profile.profile_photo.save(photo_name, File(file_obj), save=True)

            portfolio_images = data.get("portfolio_images") or []
            if portfolio_images and profile.portfolio_images.count() == 0:
                for index, image_name in enumerate(portfolio_images, start=1):
                    image_path = image_dir / image_name
                    if not image_path.exists():
                        continue
                    with image_path.open("rb") as file_obj:
                        PortfolioImage.objects.create(
                            artist=profile,
                            image=File(file_obj, name=image_name),
                            description=f"Demo {index}",
                            position=index,
                        )
            artist_profiles.append(profile)
            verb = "Creado" if created else "Actualizado"
            self.stdout.write(self.style.SUCCESS(f"  {verb} artista: {user.username} ({data['city']})"))

        # 3 ── Clientes
        client_users: list = []
        for data in CLIENTS:
            user, created = User.objects.get_or_create(
                email=data["email"],
                defaults={
                    "username": data["username"],
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "user_type": "CLIENT",
                },
            )
            if created:
                user.set_password("BlackLine2025!")
                user.save()
            client_users.append(user)
            verb = "Creado" if created else "Ya existía"
            self.stdout.write(self.style.SUCCESS(f"  {verb} cliente: {user.username}"))

        # 4 ── Citas
        now = timezone.now()
        created_count = 0
        for tpl in APPOINTMENTS_TEMPLATE:
            client = client_users[tpl["client_idx"]]
            artist = artist_profiles[tpl["artist_idx"]]
            style_name = tpl["style"]

            if style_name not in style_map:
                self.stdout.write(self.style.WARNING(f"  Estilo '{style_name}' no encontrado, se omite."))
                continue

            style_obj = style_map[style_name]

            quote = QuoteRequest.objects.create(
                client=client,
                tattoo_style=style_obj,
                body_part=tpl["body_part"],
                size_cm=tpl["size_cm"],
                is_color=tpl["is_color"],
            )

            appt = Appointment(
                client=client,
                artist=artist,
                quote=quote,
                scheduled_at=now + timedelta(days=tpl["days_ahead"]),
                status=tpl["status"],
            )
            if tpl["status"] == "COUNTER_OFFER":
                appt.counter_offer_datetime = now + timedelta(days=tpl.get("counter_offer_days", tpl["days_ahead"] + 5))
                appt.counter_offer_note = tpl.get("counter_offer_note", "")
            appt.save()
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f"✓ {created_count} citas demo creadas"))

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("═══ Datos demo listos ═══"))
        self.stdout.write("  Contraseña para todos los usuarios: BlackLine2025!")
        self.stdout.write("  Artistas:")
        for a in ARTISTS:
            self.stdout.write(f"    {a['email']}")
        self.stdout.write("  Clientes:")
        for c in CLIENTS:
            self.stdout.write(f"    {c['email']}")
