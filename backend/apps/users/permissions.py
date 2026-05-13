from rest_framework.permissions import BasePermission


class IsAdminUserTypePermission(BasePermission):
    """Allow access only to admin users by user_type."""

    message = "Solo administradores pueden realizar esta accion."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "is_admin", False))
