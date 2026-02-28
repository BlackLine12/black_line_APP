from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import QuoteRequest
from .serializers import QuoteRequestSerializer


class QuoteRequestCreateView(APIView):
    """Recibe el payload del wizard de cotización y crea un QuoteRequest."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = QuoteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(client=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
