from django.db import migrations

STYLES = [
    "Acuarela", "Biomecánico", "Blackwork", "Chicano", "Geométrico",
    "Japonés", "Lettering", "Minimalismo", "Neo-Tradicional", "New School",
    "Old School", "Realismo", "Surrealismo", "Tradicional", "Tribal",
]


def seed_styles(apps, schema_editor):
    TattooStyle = apps.get_model("artists", "TattooStyle")
    for name in STYLES:
        TattooStyle.objects.get_or_create(name=name)


def remove_styles(apps, schema_editor):
    TattooStyle = apps.get_model("artists", "TattooStyle")
    TattooStyle.objects.filter(name__in=STYLES).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("artists", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_styles, reverse_code=remove_styles),
    ]
