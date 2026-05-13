from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    UserProfileView,
    ChangePasswordView,
    UserPhotoUploadView,
    LogoutView,
    AdminResetPasswordView,
)

app_name = 'users'

urlpatterns = [
    # Autenticación JWT
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Registro y perfil
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('profile-photo/', UserPhotoUploadView.as_view(), name='profile_photo'),
    path('admin/users/<int:user_id>/reset-password/', AdminResetPasswordView.as_view(), name='admin_reset_password'),
]