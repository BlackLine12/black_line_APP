from rest_framework import permissions


class IsArtistOwnerOrReadOnly(permissions.BasePermission):
    """
    Permite lectura a cualquier usuario autenticado.
    Escritura solo al artista dueño del perfil.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # obj puede ser ArtistProfile o PortfolioImage
        if hasattr(obj, "user"):
            return obj.user == request.user
        if hasattr(obj, "artist"):
            return obj.artist.user == request.user
        return False
