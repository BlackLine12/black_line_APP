from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.db import transaction

from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada para obtener tokens JWT que utiliza el serializer CustomTokenObtainPairSerializer.
    """
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    """
    Vista para registrar nuevos usuarios.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_user = serializer.save()

        return Response(
            {
                "message": "Usuario registrado exitosamente.",
                "user": UserSerializer(new_user).data
            },
            status=status.HTTP_201_CREATED
        )

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Vista para obtener y actualizar el perfil del usuario autenticado.
    Campos editables: first_name, last_name, username, phone.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch']

    def get_object(self):
        return self.request.user
    
class ChangePasswordView(APIView):
    """
    Vista para cambiar la contraseña del usuario autenticado.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response(
            {"message": "Contraseña actualizada exitosamente"},
            status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    """
    Vista para cerrar sesión invalidando el refresh token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response(
                {"detail": "Se requiere el refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except TokenError:
            pass  # Token already expired or invalid — still a successful logout

        return Response(
            {"message": "Sesión cerrada exitosamente"},
            status=status.HTTP_200_OK,
        )