from django.apps import AppConfig


class QuotesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.quotes"
    verbose_name = "Cotizaciones"

    def ready(self):
        import apps.quotes.signals  # noqa: F401
