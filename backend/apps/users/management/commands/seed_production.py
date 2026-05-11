"""
Seed de producción para BlackLine.

Corre una sola vez: al terminar guarda un registro en SeedLog.
Si el registro ya existe, el comando termina sin hacer nada.

Ciudades con 3-4 artistas: Ciudad de México, Guadalajara, Monterrey
Ciudades con 2 artistas: Chihuahua, Tijuana, Puebla
Ciudades con 1 artista: Querétaro, León, Mérida, Cancún, Culiacán, Hermosillo, Saltillo
"""
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

SEED_VERSION = "production_v1"
DEMO_PASSWORD = "BlackLine2025!"

TATTOO_STYLES = [
    "Realismo", "Tradicional", "Neo-Tradicional", "Blackwork",
    "Geométrico", "Lettering", "Acuarela", "Japonés", "Tribal",
    "Minimalista", "Old School", "Chicano", "Biomecánico", "Puntillismo",
    "Neotradicional Mexicano",
]

ARTISTS = [
    # ── Ciudad de México (4) ──────────────────────────────────────────────
    {
        "email": "marco.vega@blackline.mx",
        "username": "marco_vega",
        "first_name": "Marco",
        "last_name": "Vega",
        "phone": "5551100001",
        "city": "Ciudad de México",
        "bio": (
            "Realismo fotográfico e ilustración de autor. 12 años de carrera, más de 3 000 piezas realizadas. "
            "Estudio propio en la Colonia Roma. Especializado en retratos, naturaleza y composiciones grandes. "
            "Colaboré con artistas de España, Colombia y Argentina."
        ),
        "base_hourly_rate": Decimal("1200.00"),
        "minimum_setup_fee": Decimal("900.00"),
        "styles": ["Realismo", "Acuarela", "Neo-Tradicional"],
    },
    {
        "email": "valentina.cruz@blackline.mx",
        "username": "valentina_cruz",
        "first_name": "Valentina",
        "last_name": "Cruz",
        "phone": "5551100002",
        "city": "Ciudad de México",
        "bio": (
            "Arte delicado y atemporal. Me especializo en acuarela y minimalismo para quienes buscan "
            "piezas íntimas con significado profundo. 7 años tatuando en CDMX, talleres en Berlín y Barcelona."
        ),
        "base_hourly_rate": Decimal("900.00"),
        "minimum_setup_fee": Decimal("650.00"),
        "styles": ["Acuarela", "Minimalista", "Lettering"],
    },
    {
        "email": "rodrigo.pena@blackline.mx",
        "username": "rodrigo_pena",
        "first_name": "Rodrigo",
        "last_name": "Peña",
        "phone": "5551100003",
        "city": "Ciudad de México",
        "bio": (
            "Japonés y blackwork son mis idiomas. 9 años de experiencia en Coyoacán, "
            "formado en Osaka con maestros de irezumi tradicional. "
            "Cada manga o espalda completa es una historia de vida."
        ),
        "base_hourly_rate": Decimal("1050.00"),
        "minimum_setup_fee": Decimal("750.00"),
        "styles": ["Japonés", "Blackwork", "Tribal"],
    },
    {
        "email": "isadora.fuentes@blackline.mx",
        "username": "isadora_fuentes",
        "first_name": "Isadora",
        "last_name": "Fuentes",
        "phone": "5551100004",
        "city": "Ciudad de México",
        "bio": (
            "Fusiono biomecánica con iconografía prehispánica mexicana. "
            "Arte que une lo ancestral con lo futurista. "
            "11 años tatuando, expositora en el Tattoo Fest México 2019, 2021 y 2023."
        ),
        "base_hourly_rate": Decimal("1100.00"),
        "minimum_setup_fee": Decimal("800.00"),
        "styles": ["Biomecánico", "Geométrico", "Neotradicional Mexicano"],
    },

    # ── Guadalajara (3) ───────────────────────────────────────────────────
    {
        "email": "ivan.castro@blackline.mx",
        "username": "ivan_castro",
        "first_name": "Iván",
        "last_name": "Castro",
        "phone": "3311100005",
        "city": "Guadalajara",
        "bio": (
            "Minimalismo y acuarela son mi lenguaje. "
            "Creo tatuajes delicados y expresivos para personas que buscan arte sutil y eterno. "
            "5 años de experiencia, especialista en diseños femeninos y lettering personalizado."
        ),
        "base_hourly_rate": Decimal("700.00"),
        "minimum_setup_fee": Decimal("450.00"),
        "styles": ["Minimalista", "Acuarela", "Lettering"],
    },
    {
        "email": "patricia.ramos@blackline.mx",
        "username": "patricia_ramos",
        "first_name": "Patricia",
        "last_name": "Ramos",
        "phone": "3311100006",
        "city": "Guadalajara",
        "bio": (
            "Old school con corazón tapatío. Llevo 8 años tatuando en Tlaquepaque "
            "con énfasis en colores saturados y líneas gruesas. "
            "Especializada en flores, animales y diseños vintage americanos."
        ),
        "base_hourly_rate": Decimal("850.00"),
        "minimum_setup_fee": Decimal("600.00"),
        "styles": ["Realismo", "Tradicional", "Old School"],
    },
    {
        "email": "tomas.ibanez@blackline.mx",
        "username": "tomas_ibanez",
        "first_name": "Tomás",
        "last_name": "Ibáñez",
        "phone": "3311100007",
        "city": "Guadalajara",
        "bio": (
            "Neo-tradicional con influencias del arte chicano. "
            "Formado en Guadalajara y Los Ángeles, mezclo tradición y modernidad en cada pieza. "
            "6 años de experiencia, especialista en puntillismo decorativo."
        ),
        "base_hourly_rate": Decimal("780.00"),
        "minimum_setup_fee": Decimal("500.00"),
        "styles": ["Neo-Tradicional", "Chicano", "Puntillismo"],
    },

    # ── Monterrey (3) ─────────────────────────────────────────────────────
    {
        "email": "daniela.flores@blackline.mx",
        "username": "daniela_flores",
        "first_name": "Daniela",
        "last_name": "Flores",
        "phone": "8181100008",
        "city": "Monterrey",
        "bio": (
            "Especialista en tatuajes japoneses y tradicionales con más de 6 años ilustrando cuerpos con historias. "
            "Amante del arte oriental, cada diseño lleva simbología auténtica y líneas limpias. "
            "Certificada por la Asociación Mexicana de Tatuadores Profesionales."
        ),
        "base_hourly_rate": Decimal("950.00"),
        "minimum_setup_fee": Decimal("700.00"),
        "styles": ["Japonés", "Tradicional", "Neo-Tradicional"],
    },
    {
        "email": "alejandro.medina@blackline.mx",
        "username": "alejandro_medina",
        "first_name": "Alejandro",
        "last_name": "Medina",
        "phone": "8181100009",
        "city": "Monterrey",
        "bio": (
            "Realismo oscuro y biomecánica son mi firma. "
            "10 años en la industria, trabajé en estudios de Monterrey, Houston y Miami. "
            "Piezas grandes en espalda, pecho y manga completa son mi especialidad."
        ),
        "base_hourly_rate": Decimal("1000.00"),
        "minimum_setup_fee": Decimal("750.00"),
        "styles": ["Realismo", "Biomecánico", "Blackwork"],
    },
    {
        "email": "natalia.guerrero@blackline.mx",
        "username": "natalia_guerrero",
        "first_name": "Natalia",
        "last_name": "Guerrero",
        "phone": "8181100010",
        "city": "Monterrey",
        "bio": (
            "Acuarela y lettering artístico. Creo piezas únicas y personalizadas "
            "con paletas de color cuidadas al detalle. "
            "4 años tatuando, exdiseñadora gráfica que encontró su vocación en la piel."
        ),
        "base_hourly_rate": Decimal("820.00"),
        "minimum_setup_fee": Decimal("550.00"),
        "styles": ["Acuarela", "Minimalista", "Lettering"],
    },

    # ── Chihuahua (2) ─────────────────────────────────────────────────────
    {
        "email": "carlos.mendoza@blackline.mx",
        "username": "carlos_mendoza",
        "first_name": "Carlos",
        "last_name": "Mendoza",
        "phone": "6141100011",
        "city": "Chihuahua",
        "bio": (
            "Tatuador con 8 años de experiencia especializado en realismo y blackwork. "
            "Cada pieza es única, creada con precisión milimétrica y tinta de calidad premium. "
            "Trabajé en estudios de Ciudad de México y Monterrey antes de abrir mi propio estudio."
        ),
        "base_hourly_rate": Decimal("850.00"),
        "minimum_setup_fee": Decimal("600.00"),
        "styles": ["Realismo", "Blackwork", "Geométrico"],
    },
    {
        "email": "rebeca.soto@blackline.mx",
        "username": "rebeca_soto",
        "first_name": "Rebeca",
        "last_name": "Soto",
        "phone": "6141100012",
        "city": "Chihuahua",
        "bio": (
            "Old school con actitud new school. Chicano art y biomecánica son mis pasiones. "
            "Llevo 10 años transformando piel en lienzo, con estudios en Los Ángeles y Tijuana. "
            "Ganadora del concurso Nacional de Arte en Piel 2022."
        ),
        "base_hourly_rate": Decimal("1100.00"),
        "minimum_setup_fee": Decimal("800.00"),
        "styles": ["Old School", "Chicano", "Biomecánico"],
    },

    # ── Tijuana (2) ───────────────────────────────────────────────────────
    {
        "email": "fernanda.lopez@blackline.mx",
        "username": "fernanda_lopez",
        "first_name": "Fernanda",
        "last_name": "López",
        "phone": "6641100013",
        "city": "Tijuana",
        "bio": (
            "Blackwork y geometría sagrada son mi especialidad. "
            "Inspirada en culturas precolombinas mexicanas, fusiono arte ancestral con diseño contemporáneo. "
            "7 años tatuando, talleres en Barcelona y Ciudad de México."
        ),
        "base_hourly_rate": Decimal("800.00"),
        "minimum_setup_fee": Decimal("550.00"),
        "styles": ["Blackwork", "Geométrico", "Tribal"],
    },
    {
        "email": "omar.quintero@blackline.mx",
        "username": "omar_quintero",
        "first_name": "Omar",
        "last_name": "Quintero",
        "phone": "6641100014",
        "city": "Tijuana",
        "bio": (
            "Arte chicano fronterizo que cuenta historias de dos culturas. "
            "Nativo de Tijuana con 9 años tatuando a ambos lados de la frontera. "
            "Especialista en letras, vírgenes, águilas y arte urbano mexicano-americano."
        ),
        "base_hourly_rate": Decimal("750.00"),
        "minimum_setup_fee": Decimal("500.00"),
        "styles": ["Chicano", "Old School", "Neotradicional Mexicano"],
    },

    # ── Puebla (2) ────────────────────────────────────────────────────────
    {
        "email": "sofia.anaya@blackline.mx",
        "username": "sofia_anaya",
        "first_name": "Sofía",
        "last_name": "Anaya",
        "phone": "2221100015",
        "city": "Puebla",
        "bio": (
            "Puntillismo y geometría sagrada con raíces en el arte poblano. "
            "Mandalas, dotwork y diseños finos son mi firma. "
            "5 años de experiencia, cada punto tiene un lugar exacto en la composición."
        ),
        "base_hourly_rate": Decimal("680.00"),
        "minimum_setup_fee": Decimal("420.00"),
        "styles": ["Puntillismo", "Geométrico", "Minimalista"],
    },
    {
        "email": "jorge.tellez@blackline.mx",
        "username": "jorge_tellez",
        "first_name": "Jorge",
        "last_name": "Téllez",
        "phone": "2221100016",
        "city": "Puebla",
        "bio": (
            "Blackwork y japonés con influencia del arte prehispánico. "
            "6 años tatuando en el centro histórico de Puebla. "
            "Mis piezas llevan ADN mexicano en cada línea."
        ),
        "base_hourly_rate": Decimal("720.00"),
        "minimum_setup_fee": Decimal("480.00"),
        "styles": ["Blackwork", "Tribal", "Japonés"],
    },

    # ── Querétaro (1) ─────────────────────────────────────────────────────
    {
        "email": "luciana.vargas@blackline.mx",
        "username": "luciana_vargas",
        "first_name": "Luciana",
        "last_name": "Vargas",
        "phone": "4421100017",
        "city": "Querétaro",
        "bio": (
            "Neo-tradicional con alma queretana. Colores vibrantes y líneas expresivas "
            "que cuentan historias visuales únicas. "
            "4 años de carrera, apasionada por la flora y fauna mexicana como inspiración."
        ),
        "base_hourly_rate": Decimal("750.00"),
        "minimum_setup_fee": Decimal("500.00"),
        "styles": ["Neo-Tradicional", "Acuarela", "Lettering"],
    },

    # ── León (1) ──────────────────────────────────────────────────────────
    {
        "email": "emilio.diaz@blackline.mx",
        "username": "emilio_diaz",
        "first_name": "Emilio",
        "last_name": "Díaz",
        "phone": "4771100018",
        "city": "León",
        "bio": (
            "Realismo y japonés en la capital zapatera. "
            "8 años de experiencia, formado en la Ciudad de México con maestros de la escena nacional. "
            "Trabajo piezas de todos los tamaños con el mismo nivel de detalle y compromiso."
        ),
        "base_hourly_rate": Decimal("800.00"),
        "minimum_setup_fee": Decimal("550.00"),
        "styles": ["Realismo", "Japonés", "Tradicional"],
    },

    # ── Mérida (1) ────────────────────────────────────────────────────────
    {
        "email": "ximena.molina@blackline.mx",
        "username": "ximena_molina",
        "first_name": "Ximena",
        "last_name": "Molina",
        "phone": "9991100019",
        "city": "Mérida",
        "bio": (
            "Arte minimalista con raíces mayas. "
            "Vivo y tatúo en la ciudad blanca, inspirada en la naturaleza yucateca y la iconografía prehispánica. "
            "3 años de carrera, especialista en piezas pequeñas con gran significado."
        ),
        "base_hourly_rate": Decimal("650.00"),
        "minimum_setup_fee": Decimal("400.00"),
        "styles": ["Minimalista", "Acuarela", "Tribal"],
    },

    # ── Cancún (1) ────────────────────────────────────────────────────────
    {
        "email": "ricardo.palma@blackline.mx",
        "username": "ricardo_palma",
        "first_name": "Ricardo",
        "last_name": "Palma",
        "phone": "9981100020",
        "city": "Cancún",
        "bio": (
            "Tradicional americano y old school en el Caribe mexicano. "
            "Llevo 6 años tatuando en la Riviera Maya, con clientela internacional. "
            "Colores brillantes, líneas perfectas y diseños que duran décadas."
        ),
        "base_hourly_rate": Decimal("900.00"),
        "minimum_setup_fee": Decimal("650.00"),
        "styles": ["Tradicional", "Old School", "Geométrico"],
    },

    # ── Culiacán (1) ──────────────────────────────────────────────────────
    {
        "email": "brenda.olvera@blackline.mx",
        "username": "brenda_olvera",
        "first_name": "Brenda",
        "last_name": "Olvera",
        "phone": "6671100021",
        "city": "Culiacán",
        "bio": (
            "Realismo y puntillismo en el norte del Pacífico. "
            "5 años de trayectoria, especialista en retratos y diseños de flora sinaloense. "
            "Mi estudio en Culiacán es punto de referencia para el arte corporal en Sinaloa."
        ),
        "base_hourly_rate": Decimal("700.00"),
        "minimum_setup_fee": Decimal("450.00"),
        "styles": ["Realismo", "Blackwork", "Puntillismo"],
    },

    # ── Hermosillo (1) ────────────────────────────────────────────────────
    {
        "email": "gabriel.serna@blackline.mx",
        "username": "gabriel_serna",
        "first_name": "Gabriel",
        "last_name": "Serna",
        "phone": "6621100022",
        "city": "Hermosillo",
        "bio": (
            "Arte japonés con iconografía del desierto sonorense. "
            "Serpientes, saguaros y naturaleza árida en estilo irezumi y neotradicional. "
            "7 años tatuando en Hermosillo, referente del tattoo en Sonora."
        ),
        "base_hourly_rate": Decimal("780.00"),
        "minimum_setup_fee": Decimal("520.00"),
        "styles": ["Japonés", "Neotradicional Mexicano", "Tribal"],
    },

    # ── Saltillo (1) ──────────────────────────────────────────────────────
    {
        "email": "luis.moreno@blackline.mx",
        "username": "luis_moreno",
        "first_name": "Luis",
        "last_name": "Moreno",
        "phone": "8441100023",
        "city": "Saltillo",
        "bio": (
            "Chicano y lettering artístico en la capital coahuilense. "
            "8 años de experiencia, formado entre Saltillo y San Antonio, Texas. "
            "Arte que habla de raíces, familia y orgullo norteño."
        ),
        "base_hourly_rate": Decimal("720.00"),
        "minimum_setup_fee": Decimal("480.00"),
        "styles": ["Chicano", "Lettering", "Neo-Tradicional"],
    },
]

CLIENTS = [
    {"email": "sofia.ramirez@demo.mx",      "username": "sofia_ramirez",      "first_name": "Sofía",     "last_name": "Ramírez",    "phone": "6141000001"},
    {"email": "diego.herrera@demo.mx",       "username": "diego_herrera",       "first_name": "Diego",     "last_name": "Herrera",    "phone": "8181000002"},
    {"email": "valeria.torres@demo.mx",      "username": "valeria_torres",      "first_name": "Valeria",   "last_name": "Torres",     "phone": "3311000003"},
    {"email": "andres.morales@demo.mx",      "username": "andres_morales",      "first_name": "Andrés",    "last_name": "Morales",    "phone": "8181000004"},
    {"email": "camila.rios@demo.mx",         "username": "camila_rios",         "first_name": "Camila",    "last_name": "Ríos",       "phone": "3311000005"},
    {"email": "roberto.sanchez@demo.mx",     "username": "roberto_sanchez",     "first_name": "Roberto",   "last_name": "Sánchez",    "phone": "6141000006"},
    {"email": "mariana.castillo@demo.mx",    "username": "mariana_castillo",    "first_name": "Mariana",   "last_name": "Castillo",   "phone": "5551000007"},
    {"email": "fernando.jimenez@demo.mx",    "username": "fernando_jimenez",    "first_name": "Fernando",  "last_name": "Jiménez",    "phone": "6641000008"},
    {"email": "lucia.vega@demo.mx",          "username": "lucia_vega",          "first_name": "Lucía",     "last_name": "Vega",       "phone": "6641000009"},
    {"email": "eduardo.gomez@demo.mx",       "username": "eduardo_gomez",       "first_name": "Eduardo",   "last_name": "Gómez",      "phone": "5551000010"},
    {"email": "paula.mendoza@demo.mx",       "username": "paula_mendoza",       "first_name": "Paula",     "last_name": "Mendoza",    "phone": "6141000011"},
    {"email": "hector.ruiz@demo.mx",         "username": "hector_ruiz",         "first_name": "Héctor",    "last_name": "Ruiz",       "phone": "8181000012"},
    {"email": "ana.gonzalez@demo.mx",        "username": "ana_gonzalez",        "first_name": "Ana",       "last_name": "González",   "phone": "5551000013"},
    {"email": "miguel.reyes@demo.mx",        "username": "miguel_reyes",        "first_name": "Miguel",    "last_name": "Reyes",      "phone": "3311000014"},
    {"email": "carolina.hernandez@demo.mx",  "username": "carolina_hernandez",  "first_name": "Carolina",  "last_name": "Hernández",  "phone": "9991000015"},
    {"email": "julio.flores@demo.mx",        "username": "julio_flores",        "first_name": "Julio",     "last_name": "Flores",     "phone": "9981000016"},
    {"email": "beatriz.chavez@demo.mx",      "username": "beatriz_chavez",      "first_name": "Beatriz",   "last_name": "Chávez",     "phone": "4421000017"},
    {"email": "oscar.delgado@demo.mx",       "username": "oscar_delgado",       "first_name": "Óscar",     "last_name": "Delgado",    "phone": "4771000018"},
    {"email": "martha.aguilar@demo.mx",      "username": "martha_aguilar",      "first_name": "Martha",    "last_name": "Aguilar",    "phone": "6671000019"},
    {"email": "rafael.miranda@demo.mx",      "username": "rafael_miranda",      "first_name": "Rafael",    "last_name": "Miranda",    "phone": "6621000020"},
]

# (client_idx, artist_idx, style, body_part, size_cm, is_color, days_ahead, status, counter_days, counter_note)
APPOINTMENTS = [
    (0,  0,  "Realismo",             "BRAZO",      20, False, 10, "PENDING",       None, None),
    (1,  1,  "Acuarela",             "HOMBRO",     15, True,   7, "APPROVED",      None, None),
    (2,  2,  "Japonés",              "ESPALDA",    40, True,  15, "COUNTER_OFFER", 20, "Prefiero el sábado siguiente para tener más tiempo con una pieza tan grande."),
    (3,  3,  "Geométrico",           "ANTEBRAZO",  12, False, 12, "PENDING",       None, None),
    (4,  4,  "Minimalista",          "CUELLO",      6, False,  5, "REJECTED",      None, None),
    (5,  5,  "Old School",           "BRAZO",      22, True,  18, "APPROVED",      None, None),
    (6,  6,  "Neo-Tradicional",      "PIERNA",     30, True,   9, "PENDING",       None, None),
    (7,  7,  "Japonés",              "ESPALDA",    45, False, 14, "COUNTER_OFFER", 19, "El miércoles tengo el slot libre para trabajar en una espalda completa con calma."),
    (8,  8,  "Realismo",             "PECHO",      28, False, 21, "PENDING",       None, None),
    (9,  9,  "Acuarela",             "COSTILLAS",  20, True,   6, "REJECTED",      None, None),
    (10, 10, "Blackwork",            "BRAZO",      35, False, 16, "APPROVED",      None, None),
    (11, 11, "Chicano",              "ANTEBRAZO",  14, False, 11, "PENDING",       None, None),
    (12, 12, "Puntillismo",          "HOMBRO",     10, False,  8, "PENDING",       None, None),
    (13, 13, "Tribal",               "PIERNA",     38, False, 13, "APPROVED",      None, None),
    (14, 14, "Lettering",            "ANTEBRAZO",   9, False,  4, "PENDING",       None, None),
    (15, 15, "Neotradicional Mexicano", "ESPALDA", 32, True,  23, "COUNTER_OFFER", 28, "Necesito ese fin de semana largo para hacer justicia a un diseño tan especial."),
    (16, 16, "Japonés",              "PIERNA",     42, True,  17, "PENDING",       None, None),
    (17, 17, "Realismo",             "BRAZO",      18, False, 25, "REJECTED",      None, None),
    (18, 18, "Blackwork",            "COSTILLAS",  22, False,  3, "PENDING",       None, None),
    (19, 19, "Minimalista",          "PIE",         5, False,  7, "APPROVED",      None, None),
]


class Command(BaseCommand):
    help = "Pobla la base de datos de producción. Corre una sola vez."

    @transaction.atomic
    def handle(self, *args, **options):
        from apps.users.models import SeedLog

        if SeedLog.objects.filter(name=SEED_VERSION).exists():
            self.stdout.write(f"  [SKIP] seed_production: '{SEED_VERSION}' ya fue ejecutado.")
            return

        self.stdout.write(self.style.MIGRATE_HEADING("\n  ── seed_production ──"))

        style_map = self._seed_styles()
        artist_profiles = self._seed_artists(style_map)
        client_users = self._seed_clients()
        self._seed_appointments(client_users, artist_profiles, style_map)

        SeedLog.objects.create(name=SEED_VERSION)
        self.stdout.write(self.style.SUCCESS(f"\n  [OK]   Seed '{SEED_VERSION}' completado y registrado.\n"))
        self._print_summary()

    # ── Estilos ────────────────────────────────────────────────────────────

    def _seed_styles(self):
        from apps.artists.models import TattooStyle

        style_map = {}
        for name in TATTOO_STYLES:
            obj, _ = TattooStyle.objects.get_or_create(name=name)
            style_map[name] = obj
        self.stdout.write(f"  [OK]   {len(TATTOO_STYLES)} estilos listos")
        return style_map

    # ── Artistas ───────────────────────────────────────────────────────────

    def _seed_artists(self, style_map):
        from django.contrib.auth import get_user_model
        from apps.artists.models import ArtistProfile

        User = get_user_model()
        profiles = []

        for data in ARTISTS:
            user, created = User.objects.get_or_create(
                email=data["email"],
                defaults={
                    "username": data["username"],
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "phone": data["phone"],
                    "user_type": "STUDIO",
                },
            )
            if created:
                user.set_password(DEMO_PASSWORD)
                user.save()

            profile, _ = ArtistProfile.objects.get_or_create(user=user)
            profile.city = data["city"]
            profile.bio = data["bio"]
            profile.base_hourly_rate = data["base_hourly_rate"]
            profile.minimum_setup_fee = data["minimum_setup_fee"]
            profile.styles.set([style_map[s] for s in data["styles"] if s in style_map])
            profile.save()
            profiles.append(profile)

            verb = "Creado" if created else "Actualizado"
            self.stdout.write(
                f"  [OK]   {verb} artista: {data['first_name']} {data['last_name']} "
                f"({data['city']}) – {', '.join(data['styles'])}"
            )

        return profiles

    # ── Clientes ───────────────────────────────────────────────────────────

    def _seed_clients(self):
        from django.contrib.auth import get_user_model

        User = get_user_model()
        users = []

        for data in CLIENTS:
            user, created = User.objects.get_or_create(
                email=data["email"],
                defaults={
                    "username": data["username"],
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "phone": data["phone"],
                    "user_type": "CLIENT",
                },
            )
            if created:
                user.set_password(DEMO_PASSWORD)
                user.save()
            users.append(user)

            verb = "Creado" if created else "Ya existía"
            self.stdout.write(
                f"  [OK]   {verb} cliente: {data['first_name']} {data['last_name']} ({data['email']})"
            )

        return users

    # ── Citas ──────────────────────────────────────────────────────────────

    def _seed_appointments(self, clients, artists, style_map):
        from apps.quotes.models import QuoteRequest, Appointment

        now = timezone.now()
        count = 0

        for row in APPOINTMENTS:
            c_idx, a_idx, style_name, body_part, size_cm, is_color, days, status, counter_days, counter_note = row

            if c_idx >= len(clients) or a_idx >= len(artists):
                continue
            if style_name not in style_map:
                continue

            client = clients[c_idx]
            artist = artists[a_idx]
            style = style_map[style_name]

            quote = QuoteRequest.objects.create(
                client=client,
                tattoo_style=style,
                body_part=body_part,
                size_cm=size_cm,
                is_color=is_color,
            )

            appt = Appointment(
                client=client,
                artist=artist,
                quote=quote,
                scheduled_at=now + timedelta(days=days),
                status=status,
            )
            if status == "COUNTER_OFFER" and counter_days:
                appt.counter_offer_datetime = now + timedelta(days=counter_days)
                appt.counter_offer_note = counter_note or ""

            appt.save()
            count += 1

        self.stdout.write(f"  [OK]   {count} citas creadas")

    # ── Resumen ────────────────────────────────────────────────────────────

    def _print_summary(self):
        from collections import Counter

        cities = Counter(a["city"] for a in ARTISTS)

        self.stdout.write("=" * 64)
        self.stdout.write("  DATOS DE PRODUCCIÓN — BlackLine")
        self.stdout.write("=" * 64)
        self.stdout.write(f"  Contraseña para todos los usuarios demo: {DEMO_PASSWORD}")
        self.stdout.write(f"\n  {len(ARTISTS)} ARTISTAS por ciudad:")
        for city, count in sorted(cities.items(), key=lambda x: -x[1]):
            self.stdout.write(f"    {city:<30} {count} artista{'s' if count > 1 else ''}")
        self.stdout.write(f"\n  {len(CLIENTS)} CLIENTES creados")
        self.stdout.write(f"  {len(APPOINTMENTS)} CITAS de ejemplo")
        self.stdout.write("=" * 64 + "\n")
