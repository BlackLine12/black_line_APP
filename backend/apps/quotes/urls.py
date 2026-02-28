from django.urls import path

from .views import QuoteRequestCreateView

app_name = "quotes"

urlpatterns = [
    path("", QuoteRequestCreateView.as_view(), name="quote-create"),
]
