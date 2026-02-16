from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Modelo de usuario personalizado que extiende de AbstractUser.
    """
    class UserType(models.TextChoices):
        CLIENT = "client", "Cliente"
        STUDIO = "studio", "Estudio/Tatuador"

    email = models.EmailField(unique=True, verbose_name="Email")
    user_type = models.CharField(max_length=20, choices=UserType.choices,
                                    default=UserType.CLIENT, verbose_name="Tipo de Usuario")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de Actualización")

    # Email como campo principal del login                             
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name"]

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    @property
    def is_client(self):
        """Retorna True si el usuario es un cliente."""
        return self.user_type == self.UserType.CLIENT
    
    @property
    def is_studio(self):
        """Retorna True si el usuario es un estudio/tatuador."""
        return self.user_type == self.UserType.STUDIO
    
    @property
    def full_name(self):
        """Retorna el nombre completo del usuario."""
        return f"{self.first_name} {self.last_name}".strip()