from rest_framework import permissions


class IsArtistOwnerOrReadOnly(permissions.BasePermission):
    """
    Permite lectura a cualquier usuario autenticado.
    Escritura solo al artista dueño del perfil.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        # Solo STUDIO y ADMIN pueden crear/editar perfiles de artista
        return request.user.user_type in ('STUDIO', 'ADMIN')

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # obj puede ser ArtistProfile o PortfolioImage
        if hasattr(obj, "user"):
            return obj.user == request.user
        if hasattr(obj, "artist"):
            return obj.artist.user == request.user
        return False
