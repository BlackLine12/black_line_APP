from rest_framework import generics, status, permissions, parsers
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
    AdminSetPasswordSerializer,
)
from .permissions import IsAdminUserTypePermission

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


class UserPhotoUploadView(APIView):
    """
    Vista para subir la foto de perfil del usuario (clientes).
    Para artistas usar POST /api/artists/profiles/me/photo/ que tiene validaciones adicionales.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def patch(self, request):
        photo = request.FILES.get('profile_photo')
        if not photo:
            return Response({"detail": "No photo provided"}, status=status.HTTP_400_BAD_REQUEST)

        allowed_mime = {"image/jpeg", "image/png", "image/webp"}
        if photo.content_type not in allowed_mime:
            return Response(
                {"detail": "Formato no permitido. Usa JPEG, PNG o WebP."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if photo.size > 5 * 1024 * 1024:
            return Response(
                {"detail": "La imagen no puede superar 5 MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        try:
            if user.profile_photo:
                user.profile_photo.delete(save=False)
        except Exception:
            pass
        user.profile_photo = photo
        user.save(update_fields=["profile_photo"])

        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


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


class AdminResetPasswordView(APIView):
    """Admin-only: establecer nueva contrasena para un usuario."""

    permission_classes = [IsAdminUserTypePermission]

    def post(self, request, user_id: int):
        payload = {**request.data, "user_id": user_id}
        serializer = AdminSetPasswordSerializer(data=payload)
        serializer.is_valid(raise_exception=True)

        target_user = User.objects.get(id=user_id)
        target_user.set_password(serializer.validated_data['new_password'])
        target_user.save(update_fields=["password"])

        return Response(
            {
                "message": "Contrasena actualizada exitosamente.",
                "user_id": target_user.id,
            },
            status=status.HTTP_200_OK,
        )