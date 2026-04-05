from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer personalizado para obtener tokens JWT.
    Acepta email o username en el campo 'email'.
    """
    username_field = "email"

    def validate(self, attrs):
        # Allow login with either email or username
        credential = attrs.get("email", "")
        password = attrs.get("password", "")

        # Try to find user by email first, then by username
        user = None
        if "@" in credential:
            try:
                user = User.objects.get(email=credential)
            except User.DoesNotExist:
                pass
        if user is None:
            try:
                user = User.objects.get(username=credential)
            except User.DoesNotExist:
                pass

        if user is None or not user.check_password(password):
            raise serializers.ValidationError(
                "Credenciales inválidas. Verifica tu email/username y contraseña."
            )

        if not user.is_active:
            raise serializers.ValidationError("Esta cuenta está desactivada.")

        # Generate tokens
        refresh = self.get_token(user)
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "user_type": user.user_type,
                "phone": getattr(user, "phone", None),
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat(),
                "updated_at": user.updated_at.isoformat(),
            },
        }
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Agregar informacion adicional al token
        token['email'] = user.email
        token['user_type'] = user.user_type
        token['full_name'] = user.full_name
        
        return token
    
class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar información del usuario.
    """

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'user_type', 'phone', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'email', 'user_type', 'is_active', 'created_at', 'updated_at']

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer para registrar nuevos usuarios.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
            'user_type',
            'phone',
        ]
    
    def validate(self, attrs):
        """Validar que las contraseñas coincidan y bloquear tipo ADMIN."""
        if attrs.get('user_type') == User.UserType.ADMIN:
            raise serializers.ValidationError({
                "user_type": "No es posible registrarse como administrador."
            })
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Las contraseñas no coinciden."
            })
        return attrs
    
    def create(self, validated_data):
        """Crear un nuevo usuario."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        return User.objects.create_user(password=password, **validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer para cambiar la contraseña.
    """
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validar que las contraseñas nuevas coincidan."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Las contraseñas no coinciden."
            })
        return attrs
    
    def validate_old_password(self, value):
        """Validar que la contraseña anterior sea correcta."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña anterior es incorrecta.")
        return value
