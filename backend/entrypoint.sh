#!/bin/zsh
set -e

cd /app

echo "⏳ Esperando migraciones..."
python manage.py migrate --noinput

echo "📦 Creando estilos de tatuaje si no existen..."
python manage.py shell -c "
from apps.artists.models import TattooStyle
styles = ['Realismo', 'Tradicional', 'Neo Tradicional', 'Japonés', 'Lettering', 'Blackwork', 'Dotwork', 'Acuarela', 'Minimalista', 'Geométrico']
for s in styles:
    TattooStyle.objects.get_or_create(name=s)
print(f'  ✅ {TattooStyle.objects.count()} estilos listos')
"

echo "🚀 Iniciando servidor Django..."
exec python manage.py runserver 0.0.0.0:8000
