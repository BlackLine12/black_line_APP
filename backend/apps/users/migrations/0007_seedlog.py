from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0006_user_profile_photo"),
    ]

    operations = [
        migrations.CreateModel(
            name="SeedLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100, unique=True)),
                ("ran_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Registro de Seed",
                "verbose_name_plural": "Registros de Seed",
            },
        ),
    ]
