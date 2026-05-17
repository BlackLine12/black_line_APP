"""
Seed de producción — Ciudad Juárez (32 artistas).

Corre una sola vez: al terminar guarda un registro en SeedLog con SEED_VERSION.
Si el registro ya existe, el comando termina sin hacer nada.

Uso:
    python manage.py seed_juarez
"""
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

SEED_VERSION = "juarez_v1"
DEMO_PASSWORD = "BlackLine2025!"

TATTOO_STYLES = [
    "Realismo", "Tradicional", "Neo-Tradicional", "Blackwork",
    "Geométrico", "Lettering", "Acuarela", "Japonés", "Tribal",
    "Minimalista", "Old School", "Chicano", "Biomecánico", "Puntillismo",
    "Neotradicional Mexicano",
]

ARTISTS = [
    # ── Ciudad Juárez — 32 artistas ──────────────────────────────────────────
    {
        "email": "ernesto.rivas@blackline.mx",
        "username": "ernesto_rivas",
        "first_name": "Ernesto",
        "last_name": "Rivas",
        "phone": "6561200001",
        "city": "Ciudad Juárez",
        "bio": (
            "Realismo fotográfico con más de 11 años tatuando en la frontera. "
            "Retratos, fauna y composiciones grandes son mi especialidad. "
            "Formado en Ciudad de México y con residencias en El Paso, Texas."
        ),
        "base_hourly_rate": Decimal("1050.00"),
        "minimum_setup_fee": Decimal("750.00"),
        "styles": ["Realismo", "Blackwork", "Geométrico"],
    },
    {
        "email": "miriam.lozano@blackline.mx",
        "username": "miriam_lozano",
        "first_name": "Miriam",
        "last_name": "Lozano",
        "phone": "6561200002",
        "city": "Ciudad Juárez",
        "bio": (
            "Acuarela y minimalismo para quienes buscan piezas íntimas. "
            "7 años de carrera, exdiseñadora gráfica que encontró su vocación en la piel. "
            "Cada trazo lleva intención y color cuidado al detalle."
        ),
        "base_hourly_rate": Decimal("800.00"),
        "minimum_setup_fee": Decimal("550.00"),
        "styles": ["Acuarela", "Minimalista", "Lettering"],
    },
    {
        "email": "hector.beltran@blackline.mx",
        "username": "hector_beltran",
        "first_name": "Héctor",
        "last_name": "Beltrán",
        "phone": "6561200003",
        "city": "Ciudad Juárez",
        "bio": (
            "Chicano art fronterizo que une dos culturas en una sola línea. "
            "Nativo de Juárez con 9 años tatuando a ambos lados de la frontera. "
            "Vírgenes, águilas, rosas y letras que hablan de identidad y orgullo."
        ),
        "base_hourly_rate": Decimal("900.00"),
        "minimum_setup_fee": Decimal("650.00"),
        "styles": ["Chicano", "Old School", "Neotradicional Mexicano"],
    },
    {
        "email": "ana.duran@blackline.mx",
        "username": "ana_duran",
        "first_name": "Ana",
        "last_name": "Durán",
        "phone": "6561200004",
        "city": "Ciudad Juárez",
        "bio": (
            "Puntillismo y geometría sagrada como lenguaje visual. "
            "Mandalas, dotwork y diseños de línea fina son mi firma desde hace 5 años. "
            "Cada punto tiene un lugar exacto en la composición."
        ),
        "base_hourly_rate": Decimal("720.00"),
        "minimum_setup_fee": Decimal("480.00"),
        "styles": ["Puntillismo", "Geométrico", "Minimalista"],
    },
    {
        "email": "roberto.escobedo@blackline.mx",
        "username": "roberto_escobedo",
        "first_name": "Roberto",
        "last_name": "Escobedo",
        "phone": "6561200005",
        "city": "Ciudad Juárez",
        "bio": (
            "Japonés clásico y blackwork con influencia del norte de México. "
            "8 años de experiencia, formado con maestros de irezumi en Ciudad de México. "
            "Mangas completas y espaldas son mi obra cumbre."
        ),
        "base_hourly_rate": Decimal("1000.00"),
        "minimum_setup_fee": Decimal("700.00"),
        "styles": ["Japonés", "Blackwork", "Tribal"],
    },
    {
        "email": "claudia.villa@blackline.mx",
        "username": "claudia_villa",
        "first_name": "Claudia",
        "last_name": "Villa",
        "phone": "6561200006",
        "city": "Ciudad Juárez",
        "bio": (
            "Neo-tradicional con paletas de color vibrante y trazo limpio. "
            "6 años tatuando, con taller en Juárez y visitas a convenciones de El Paso. "
            "Flora, fauna y retratos ilustrativos con mucho carácter."
        ),
        "base_hourly_rate": Decimal("850.00"),
        "minimum_setup_fee": Decimal("600.00"),
        "styles": ["Neo-Tradicional", "Acuarela", "Lettering"],
    },
    {
        "email": "jorge.enriquez@blackline.mx",
        "username": "jorge_enriquez",
        "first_name": "Jorge",
        "last_name": "Enríquez",
        "phone": "6561200007",
        "city": "Ciudad Juárez",
        "bio": (
            "Biomecánica y realismo oscuro como identidad visual. "
            "10 años en la industria, con experiencia en estudios de Monterrey y Dallas. "
            "Piezas de gran formato en espalda, pecho y mangas completas."
        ),
        "base_hourly_rate": Decimal("1100.00"),
        "minimum_setup_fee": Decimal("800.00"),
        "styles": ["Biomecánico", "Realismo", "Blackwork"],
    },
    {
        "email": "vanessa.armendariz@blackline.mx",
        "username": "vanessa_armendariz",
        "first_name": "Vanessa",
        "last_name": "Armendáriz",
        "phone": "6561200008",
        "city": "Ciudad Juárez",
        "bio": (
            "Lettering artístico y caligrafía tatuada con precisión. "
            "4 años especializándome en tipografía, frases y dedicatorias personalizadas. "
            "Cada letra lleva el peso de las palabras que importan."
        ),
        "base_hourly_rate": Decimal("680.00"),
        "minimum_setup_fee": Decimal("420.00"),
        "styles": ["Lettering", "Minimalista", "Puntillismo"],
    },
    {
        "email": "samuel.quezada@blackline.mx",
        "username": "samuel_quezada",
        "first_name": "Samuel",
        "last_name": "Quezada",
        "phone": "6561200009",
        "city": "Ciudad Juárez",
        "bio": (
            "Old school americano con raíces en el arte fronterizo. "
            "12 años de carrera, más de 2 500 piezas realizadas en Juárez y El Paso. "
            "Colores saturados, líneas gruesas y diseños que duran toda una vida."
        ),
        "base_hourly_rate": Decimal("950.00"),
        "minimum_setup_fee": Decimal("680.00"),
        "styles": ["Old School", "Tradicional", "Chicano"],
    },
    {
        "email": "liliana.corral@blackline.mx",
        "username": "liliana_corral",
        "first_name": "Liliana",
        "last_name": "Corral",
        "phone": "6561200010",
        "city": "Ciudad Juárez",
        "bio": (
            "Realismo delicado con enfoque en retratos femeninos e infantiles. "
            "5 años tatuando, especialista en grises y técnica de aguadas. "
            "Capturo emociones en la piel con precisión y sensibilidad."
        ),
        "base_hourly_rate": Decimal("870.00"),
        "minimum_setup_fee": Decimal("620.00"),
        "styles": ["Realismo", "Puntillismo", "Minimalista"],
    },
    {
        "email": "antonio.miramontes@blackline.mx",
        "username": "antonio_miramontes",
        "first_name": "Antonio",
        "last_name": "Miramontes",
        "phone": "6561200011",
        "city": "Ciudad Juárez",
        "bio": (
            "Geométrico y tribal moderno con influencia del arte indígena del norte. "
            "7 años de carrera, cada diseño es una exploración de patrones y simetría. "
            "Referente del tattoo geométrico en Chihuahua."
        ),
        "base_hourly_rate": Decimal("780.00"),
        "minimum_setup_fee": Decimal("520.00"),
        "styles": ["Geométrico", "Tribal", "Blackwork"],
    },
    {
        "email": "diana.rascon@blackline.mx",
        "username": "diana_rascon",
        "first_name": "Diana",
        "last_name": "Rascón",
        "phone": "6561200012",
        "city": "Ciudad Juárez",
        "bio": (
            "Neotradicional mexicano con iconografía del desierto chihuahuense. "
            "Cactus, serpientes de cascabel y flora árida en composiciones expresivas. "
            "6 años tatuando, expositora en el Tattoo Fest Juárez 2022 y 2024."
        ),
        "base_hourly_rate": Decimal("820.00"),
        "minimum_setup_fee": Decimal("580.00"),
        "styles": ["Neotradicional Mexicano", "Neo-Tradicional", "Acuarela"],
    },
    {
        "email": "pablo.terrazas@blackline.mx",
        "username": "pablo_terrazas",
        "first_name": "Pablo",
        "last_name": "Terrazas",
        "phone": "6561200013",
        "city": "Ciudad Juárez",
        "bio": (
            "Blackwork y ornamental con líneas finas y gran precisión. "
            "9 años tatuando, formado en Guadalajara y con residencias en Austin, Texas. "
            "Diseños decorativos que abrazan y enmarcan el cuerpo."
        ),
        "base_hourly_rate": Decimal("930.00"),
        "minimum_setup_fee": Decimal("660.00"),
        "styles": ["Blackwork", "Geométrico", "Puntillismo"],
    },
    {
        "email": "fernanda.olivas@blackline.mx",
        "username": "fernanda_olivas",
        "first_name": "Fernanda",
        "last_name": "Olivas",
        "phone": "6561200014",
        "city": "Ciudad Juárez",
        "bio": (
            "Acuarela expresiva y arte ilustrativo para piezas únicas. "
            "3 años de carrera intensa, formación en bellas artes aplicada a la piel. "
            "Paletas de color cuidadas y composiciones que fluyen con el cuerpo."
        ),
        "base_hourly_rate": Decimal("700.00"),
        "minimum_setup_fee": Decimal("450.00"),
        "styles": ["Acuarela", "Neo-Tradicional", "Minimalista"],
    },
    {
        "email": "carlos.prieto@blackline.mx",
        "username": "carlos_prieto",
        "first_name": "Carlos",
        "last_name": "Prieto",
        "phone": "6561200015",
        "city": "Ciudad Juárez",
        "bio": (
            "Japonés y tradicional americano en la ciudad fronteriza. "
            "13 años en el oficio, mi estudio en el centro de Juárez es punto de referencia. "
            "Koi, dragones y flores de cerezo son mis composiciones favoritas."
        ),
        "base_hourly_rate": Decimal("1080.00"),
        "minimum_setup_fee": Decimal("770.00"),
        "styles": ["Japonés", "Tradicional", "Old School"],
    },
    {
        "email": "yesenia.porras@blackline.mx",
        "username": "yesenia_porras",
        "first_name": "Yesenia",
        "last_name": "Porras",
        "phone": "6561200016",
        "city": "Ciudad Juárez",
        "bio": (
            "Minimalismo y fine line para diseños elegantes y atemporales. "
            "4 años tatuando, especialista en línea fina, flores pequeñas y símbolos. "
            "El arte sutil que dice mucho con poco."
        ),
        "base_hourly_rate": Decimal("650.00"),
        "minimum_setup_fee": Decimal("400.00"),
        "styles": ["Minimalista", "Lettering", "Puntillismo"],
    },
    {
        "email": "ivan.marquez@blackline.mx",
        "username": "ivan_marquez",
        "first_name": "Iván",
        "last_name": "Márquez",
        "phone": "6561200017",
        "city": "Ciudad Juárez",
        "bio": (
            "Realismo en color con especialización en naturaleza y animales. "
            "8 años de trayectoria, cada pieza es un estudio anatómico aplicado a la piel. "
            "Lobos, águilas y leones son mis sujetos favoritos."
        ),
        "base_hourly_rate": Decimal("980.00"),
        "minimum_setup_fee": Decimal("700.00"),
        "styles": ["Realismo", "Neo-Tradicional", "Tradicional"],
    },
    {
        "email": "graciela.fuentes@blackline.mx",
        "username": "graciela_fuentes",
        "first_name": "Graciela",
        "last_name": "Fuentes",
        "phone": "6561200018",
        "city": "Ciudad Juárez",
        "bio": (
            "Chicano art y lettering con raíces en el barrio juarense. "
            "11 años tatuando, arte que habla de familia, fe y frontera. "
            "Sagrado corazón, rosas y escritura a mano son mi identidad."
        ),
        "base_hourly_rate": Decimal("860.00"),
        "minimum_setup_fee": Decimal("600.00"),
        "styles": ["Chicano", "Lettering", "Neotradicional Mexicano"],
    },
    {
        "email": "martin.chavez@blackline.mx",
        "username": "martin_chavez",
        "first_name": "Martín",
        "last_name": "Chávez",
        "phone": "6561200019",
        "city": "Ciudad Juárez",
        "bio": (
            "Biomecánica y dark art para amantes del tattoo extremo. "
            "9 años de carrera, referente del estilo oscuro en la región norte. "
            "Piezas de gran formato que transforman el cuerpo en obra de arte."
        ),
        "base_hourly_rate": Decimal("1050.00"),
        "minimum_setup_fee": Decimal("760.00"),
        "styles": ["Biomecánico", "Blackwork", "Geométrico"],
    },
    {
        "email": "esperanza.nevarez@blackline.mx",
        "username": "esperanza_nevarez",
        "first_name": "Esperanza",
        "last_name": "Nevarez",
        "phone": "6561200020",
        "city": "Ciudad Juárez",
        "bio": (
            "Arte floral en acuarela y neo-tradicional para piezas llenas de vida. "
            "5 años tatuando, especialista en flores silvestres y botanicals. "
            "Cada diseño celebra la belleza efímera hecha permanente."
        ),
        "base_hourly_rate": Decimal("750.00"),
        "minimum_setup_fee": Decimal("500.00"),
        "styles": ["Acuarela", "Neo-Tradicional", "Minimalista"],
    },
    {
        "email": "alejandro.ponce@blackline.mx",
        "username": "alejandro_ponce",
        "first_name": "Alejandro",
        "last_name": "Ponce",
        "phone": "6561200021",
        "city": "Ciudad Juárez",
        "bio": (
            "Tribal polinésico y maorí adaptado al arte fronterizo. "
            "7 años investigando y ejecutando patrones tribales auténticos. "
            "Piezas que respetan la simbología de origen y la adaptan al cliente moderno."
        ),
        "base_hourly_rate": Decimal("820.00"),
        "minimum_setup_fee": Decimal("560.00"),
        "styles": ["Tribal", "Geométrico", "Blackwork"],
    },
    {
        "email": "rosa.provencio@blackline.mx",
        "username": "rosa_provencio",
        "first_name": "Rosa",
        "last_name": "Provencio",
        "phone": "6561200022",
        "city": "Ciudad Juárez",
        "bio": (
            "Realismo blanco y negro con técnica de grabado. "
            "6 años tatuando, ex ilustradora editorial que lleva el trazo al cuerpo. "
            "Precisión, contraste y detalle milimétrico en cada pieza."
        ),
        "base_hourly_rate": Decimal("890.00"),
        "minimum_setup_fee": Decimal("630.00"),
        "styles": ["Realismo", "Blackwork", "Puntillismo"],
    },
    {
        "email": "oscar.valenzuela@blackline.mx",
        "username": "oscar_valenzuela",
        "first_name": "Óscar",
        "last_name": "Valenzuela",
        "phone": "6561200023",
        "city": "Ciudad Juárez",
        "bio": (
            "Old school con soul chicano y 14 años de experiencia. "
            "Leyenda viva del tattoo en Juárez, con clientela de ambos lados de la frontera. "
            "Anclas, golondrinas, corazones y pinup son mi legado."
        ),
        "base_hourly_rate": Decimal("1000.00"),
        "minimum_setup_fee": Decimal("720.00"),
        "styles": ["Old School", "Chicano", "Tradicional"],
    },
    {
        "email": "nadia.caballero@blackline.mx",
        "username": "nadia_caballero",
        "first_name": "Nadia",
        "last_name": "Caballero",
        "phone": "6561200024",
        "city": "Ciudad Juárez",
        "bio": (
            "Ilustración de autor tatuada: personajes, escenas y narrativas visuales. "
            "5 años convirtiendo ideas en piezas únicas con estilo propio. "
            "Mis tatuajes cuentan una historia completa en cada sesión."
        ),
        "base_hourly_rate": Decimal("770.00"),
        "minimum_setup_fee": Decimal("520.00"),
        "styles": ["Neo-Tradicional", "Acuarela", "Lettering"],
    },
    {
        "email": "eugenio.torres@blackline.mx",
        "username": "eugenio_torres",
        "first_name": "Eugenio",
        "last_name": "Torres",
        "phone": "6561200025",
        "city": "Ciudad Juárez",
        "bio": (
            "Japonés moderno con fusión de elementos norteños mexicanos. "
            "10 años de oficio, especialista en fondos de agua, nubes y paisajes orientales. "
            "Cada manga es una conversación entre Oriente y la frontera."
        ),
        "base_hourly_rate": Decimal("1020.00"),
        "minimum_setup_fee": Decimal("740.00"),
        "styles": ["Japonés", "Neotradicional Mexicano", "Tribal"],
    },
    {
        "email": "leticia.saenz@blackline.mx",
        "username": "leticia_saenz",
        "first_name": "Leticia",
        "last_name": "Sáenz",
        "phone": "6561200026",
        "city": "Ciudad Juárez",
        "bio": (
            "Puntillismo fino y mandala con una paciencia que se nota en cada punto. "
            "4 años de especialización, trabajos de precisión que requieren varias sesiones. "
            "El dotwork es meditación aplicada a la piel."
        ),
        "base_hourly_rate": Decimal("710.00"),
        "minimum_setup_fee": Decimal("460.00"),
        "styles": ["Puntillismo", "Geométrico", "Minimalista"],
    },
    {
        "email": "rafael.dominguez@blackline.mx",
        "username": "rafael_dominguez",
        "first_name": "Rafael",
        "last_name": "Domínguez",
        "phone": "6561200027",
        "city": "Ciudad Juárez",
        "bio": (
            "Biomecánica futurista y sci-fi art en la piel. "
            "8 años transformando cuerpos en máquinas de arte. "
            "Prótesis visuales, circuitos y engranajes con realismo impactante."
        ),
        "base_hourly_rate": Decimal("1070.00"),
        "minimum_setup_fee": Decimal("780.00"),
        "styles": ["Biomecánico", "Realismo", "Geométrico"],
    },
    {
        "email": "silvia.alba@blackline.mx",
        "username": "silvia_alba",
        "first_name": "Silvia",
        "last_name": "Alba",
        "phone": "6561200028",
        "city": "Ciudad Juárez",
        "bio": (
            "Acuarela suelta y abstracta para tatuajes únicos e irrepetibles. "
            "3 años de carrera con influencia del arte contemporáneo internacional. "
            "Manchas de color, splash y degradados que jamás se repiten."
        ),
        "base_hourly_rate": Decimal("730.00"),
        "minimum_setup_fee": Decimal("480.00"),
        "styles": ["Acuarela", "Minimalista", "Neo-Tradicional"],
    },
    {
        "email": "daniel.aguirre@blackline.mx",
        "username": "daniel_aguirre",
        "first_name": "Daniel",
        "last_name": "Aguirre",
        "phone": "6561200029",
        "city": "Ciudad Juárez",
        "bio": (
            "Realismo en color hiperrealista con especialización en retratos. "
            "7 años capturando rostros amados en la piel de sus personas. "
            "La memoria tatuada es el tributo más permanente que existe."
        ),
        "base_hourly_rate": Decimal("960.00"),
        "minimum_setup_fee": Decimal("690.00"),
        "styles": ["Realismo", "Neo-Tradicional", "Puntillismo"],
    },
    {
        "email": "patricia.amaya@blackline.mx",
        "username": "patricia_amaya",
        "first_name": "Patricia",
        "last_name": "Amaya",
        "phone": "6561200030",
        "city": "Ciudad Juárez",
        "bio": (
            "Lettering gótico y caligrafía artística con años de estudio tipográfico. "
            "6 años tatuando texto como arte visual. "
            "Frases, nombres y poemas con la fuente y el peso exacto que merecen."
        ),
        "base_hourly_rate": Decimal("690.00"),
        "minimum_setup_fee": Decimal("440.00"),
        "styles": ["Lettering", "Blackwork", "Minimalista"],
    },
    {
        "email": "humberto.carreon@blackline.mx",
        "username": "humberto_carreon",
        "first_name": "Humberto",
        "last_name": "Carreón",
        "phone": "6561200031",
        "city": "Ciudad Juárez",
        "bio": (
            "Neotradicional mexicano con figuras de la cultura popular del norte. "
            "9 años tatuando íconos del desierto: víboras, escorpiones y cactos en clave ilustrativa. "
            "Arte que celebra ser del norte de México."
        ),
        "base_hourly_rate": Decimal("840.00"),
        "minimum_setup_fee": Decimal("590.00"),
        "styles": ["Neotradicional Mexicano", "Chicano", "Neo-Tradicional"],
    },
    {
        "email": "andrea.herrera@blackline.mx",
        "username": "andrea_herrera",
        "first_name": "Andrea",
        "last_name": "Herrera",
        "phone": "6561200032",
        "city": "Ciudad Juárez",
        "bio": (
            "Blackwork ornamental y mandalas con inspiración en arquitectura islámica y azteca. "
            "5 años creando piezas simétricas de gran impacto visual. "
            "Cada ornamento enmarca el cuerpo como si fuera una catedral."
        ),
        "base_hourly_rate": Decimal("810.00"),
        "minimum_setup_fee": Decimal("560.00"),
        "styles": ["Blackwork", "Geométrico", "Puntillismo"],
    },
]


class Command(BaseCommand):
    help = "Pobla la base de datos con 32 artistas en Ciudad Juárez. Corre una sola vez."

    @transaction.atomic
    def handle(self, *args, **options):
        from apps.users.models import SeedLog

        if SeedLog.objects.filter(name=SEED_VERSION).exists():
            self.stdout.write(f"  [SKIP] seed_juarez: '{SEED_VERSION}' ya fue ejecutado.")
            return

        self.stdout.write(self.style.MIGRATE_HEADING("\n  ── seed_juarez ──"))

        style_map = self._seed_styles()
        self._seed_artists(style_map)

        SeedLog.objects.create(name=SEED_VERSION)
        self.stdout.write(self.style.SUCCESS(f"\n  [OK]   Seed '{SEED_VERSION}' completado y registrado.\n"))
        self._print_summary()

    # ── Estilos ────────────────────────────────────────────────────────────────

    def _seed_styles(self):
        from apps.artists.models import TattooStyle

        style_map = {}
        for name in TATTOO_STYLES:
            obj, _ = TattooStyle.objects.get_or_create(name=name)
            style_map[name] = obj
        self.stdout.write(f"  [OK]   {len(TATTOO_STYLES)} estilos listos")
        return style_map

    # ── Artistas ───────────────────────────────────────────────────────────────

    def _seed_artists(self, style_map):
        from django.contrib.auth import get_user_model
        from apps.artists.models import ArtistProfile

        User = get_user_model()

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

            verb = "Creado" if created else "Actualizado"
            self.stdout.write(
                f"  [OK]   {verb} artista: {data['first_name']} {data['last_name']} "
                f"– {', '.join(data['styles'])}"
            )

    # ── Resumen ────────────────────────────────────────────────────────────────

    def _print_summary(self):
        self.stdout.write("=" * 64)
        self.stdout.write("  ARTISTAS CIUDAD JUÁREZ — BlackLine")
        self.stdout.write("=" * 64)
        self.stdout.write(f"  Contraseña para todos los usuarios: {DEMO_PASSWORD}")
        self.stdout.write(f"\n  {len(ARTISTS)} artistas creados en Ciudad Juárez")
        self.stdout.write("\n  Correos de artistas:")
        for a in ARTISTS:
            self.stdout.write(f"    {a['email']}")
        self.stdout.write("=" * 64 + "\n")
