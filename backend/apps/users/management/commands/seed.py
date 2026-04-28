"""
Comando de seeding para desarrollo.

Uso:
    python manage.py seed           # Crea todos los datos
    python manage.py seed --flush   # Borra todo primero y re-crea

Crea:
    - 1 superusuario ADMIN
    - 3 clientes (CLIENT)
    - 4 artistas (STUDIO) con perfil completo, estilos y citas de ejemplo
    - 2 cotizaciones de ejemplo
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

ADMIN_DATA = {
    "email": "admin@blackline.mx",
    "username": "admin",
    "password": "Admin1234!",
    "first_name": "Super",
    "last_name": "Admin",
    "user_type": "ADMIN",
    "is_staff": True,
    "is_superuser": True,
}

CLIENTS = [
    {
        "email": "cliente1@test.mx",
        "username": "cliente1",
        "password": "Test1234!",
        "first_name": "Sofía",
        "last_name": "Ramírez",
        "user_type": "CLIENT",
        "phone": "6141000001",
    },
    {
        "email": "cliente2@test.mx",
        "username": "cliente2",
        "password": "Test1234!",
        "first_name": "Diego",
        "last_name": "Herrera",
        "user_type": "CLIENT",
        "phone": "6141000002",
    },
    {
        "email": "cliente3@test.mx",
        "username": "cliente3",
        "password": "Test1234!",
        "first_name": "Valeria",
        "last_name": "Torres",
        "user_type": "CLIENT",
        "phone": "6141000003",
    },
]

ARTISTS = [
    {
        "user": {
            "email": "artista1@test.mx",
            "username": "artista1",
            "password": "Test1234!",
            "first_name": "Carlos",
            "last_name": "Mendoza",
            "user_type": "STUDIO",
            "phone": "6141100001",
        },
        "profile": {
            "city": "Chihuahua",
            "bio": (
                "Tatuador con 8 años de experiencia especializado en realismo y blackwork. "
                "Cada pieza es única, creada con precisión milimétrica y tinta de calidad premium."
            ),
            "base_hourly_rate": "850.00",
            "minimum_setup_fee": "600.00",
            "styles": ["Realismo", "Blackwork", "Geométrico"],
        },
    },
    {
        "user": {
            "email": "artista2@test.mx",
            "username": "artista2",
            "password": "Test1234!",
            "first_name": "Daniela",
            "last_name": "Flores",
            "user_type": "STUDIO",
            "phone": "6141100002",
        },
        "profile": {
            "city": "Monterrey",
            "bio": (
                "Especialista en tatuajes japoneses y tradicionales. "
                "Amante del arte oriental con más de 6 años ilustrando cuerpos con historias."
            ),
            "base_hourly_rate": "950.00",
            "minimum_setup_fee": "700.00",
            "styles": ["Japonés", "Tradicional", "Neo-Tradicional"],
        },
    },
    {
        "user": {
            "email": "artista3@test.mx",
            "username": "artista3",
            "password": "Test1234!",
            "first_name": "Iván",
            "last_name": "Castro",
            "user_type": "STUDIO",
            "phone": "6141100003",
        },
        "profile": {
            "city": "Guadalajara",
            "bio": (
                "Minimalismo y acuarela son mi lenguaje. "
                "Creo tatuajes delicados y expresivos para personas que buscan arte sutil y eterno."
            ),
            "base_hourly_rate": "700.00",
            "minimum_setup_fee": "450.00",
            "styles": ["Minimalismo", "Acuarela", "Lettering"],
        },
    },
    {
        "user": {
            "email": "artista4@test.mx",
            "username": "artista4",
            "password": "Test1234!",
            "first_name": "Rebeca",
            "last_name": "Soto",
            "user_type": "STUDIO",
            "phone": "6141100004",
        },
        "profile": {
            "city": "Chihuahua",
            "bio": (
                "Old school con actitud new school. "
                "Chicano art y biomecánica son mis pasiones; llevo 10 años transformando piel en lienzo."
            ),
            "base_hourly_rate": "1100.00",
            "minimum_setup_fee": "800.00",
            "styles": ["Old School", "Chicano", "Biomecánico"],
        },
    },
]


class Command(BaseCommand):
    help = "Crea datos de prueba para desarrollo (admin, clientes y artistas)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Elimina usuarios de prueba existentes antes de crear nuevos",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["flush"]:
            self._flush()

        self._create_admin()
        self._create_clients()
        self._create_artists()

        self.stdout.write(self.style.SUCCESS("\n✔  Seeding completado.\n"))
        self._print_credentials()

    # ── Flush ──────────────────────────────────────────────────────────────

    def _flush(self):
        seed_emails = (
            [ADMIN_DATA["email"]]
            + [c["email"] for c in CLIENTS]
            + [a["user"]["email"] for a in ARTISTS]
        )
        deleted, _ = User.objects.filter(email__in=seed_emails).delete()
        self.stdout.write(f"  Eliminados {deleted} usuarios de prueba anteriores.")

    # ── Admin ──────────────────────────────────────────────────────────────

    def _create_admin(self):
        email = ADMIN_DATA["email"]
        if User.objects.filter(email=email).exists():
            self.stdout.write(f"  [SKIP] Admin ya existe: {email}")
            return

        User.objects.create_superuser(
            email=email,
            username=ADMIN_DATA["username"],
            password=ADMIN_DATA["password"],
            first_name=ADMIN_DATA["first_name"],
            last_name=ADMIN_DATA["last_name"],
        )
        self.stdout.write(f"  [OK]   Admin creado: {email}")

    # ── Clientes ───────────────────────────────────────────────────────────

    def _create_clients(self):
        for data in CLIENTS:
            if User.objects.filter(email=data["email"]).exists():
                self.stdout.write(f"  [SKIP] Cliente ya existe: {data['email']}")
                continue

            User.objects.create_user(
                email=data["email"],
                username=data["username"],
                password=data["password"],
                first_name=data["first_name"],
                last_name=data["last_name"],
                user_type=data["user_type"],
                phone=data.get("phone", ""),
            )
            self.stdout.write(f"  [OK]   Cliente creado: {data['email']}")

    # ── Artistas ───────────────────────────────────────────────────────────

    def _create_artists(self):
        from apps.artists.models import ArtistProfile, TattooStyle

        for entry in ARTISTS:
            udata = entry["user"]
            pdata = entry["profile"]

            if User.objects.filter(email=udata["email"]).exists():
                self.stdout.write(f"  [SKIP] Artista ya existe: {udata['email']}")
                continue

            user = User.objects.create_user(
                email=udata["email"],
                username=udata["username"],
                password=udata["password"],
                first_name=udata["first_name"],
                last_name=udata["last_name"],
                user_type=udata["user_type"],
                phone=udata.get("phone", ""),
            )

            profile = ArtistProfile.objects.create(
                user=user,
                city=pdata["city"],
                bio=pdata["bio"],
                base_hourly_rate=pdata["base_hourly_rate"],
                minimum_setup_fee=pdata["minimum_setup_fee"],
            )

            styles = TattooStyle.objects.filter(name__in=pdata["styles"])
            profile.styles.set(styles)

            self.stdout.write(
                f"  [OK]   Artista creado: {udata['email']} "
                f"({pdata['city']}) – {', '.join(pdata['styles'])}"
            )

    # ── Tabla de credenciales ──────────────────────────────────────────────

    def _print_credentials(self):
        self.stdout.write("\n" + "=" * 58)
        self.stdout.write("  CREDENCIALES DE PRUEBA")
        self.stdout.write("=" * 58)

        self.stdout.write("\n  ADMIN")
        self.stdout.write(f"    email:    {ADMIN_DATA['email']}")
        self.stdout.write(f"    password: {ADMIN_DATA['password']}")
        self.stdout.write(f"    Django Admin → http://localhost:8000/admin/")

        self.stdout.write("\n  CLIENTES")
        for c in CLIENTS:
            self.stdout.write(
                f"    {c['first_name']} {c['last_name']:<12} "
                f"{c['email']:<25}  pw: {c['password']}"
            )

        self.stdout.write("\n  ARTISTAS (STUDIO)")
        for a in ARTISTS:
            u = a["user"]
            p = a["profile"]
            self.stdout.write(
                f"    {u['first_name']} {u['last_name']:<12} "
                f"{u['email']:<25}  pw: {u['password']}  ({p['city']})"
            )

        self.stdout.write("=" * 58 + "\n")
