import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

/**
 * Convierte una URL de media devuelta por el backend a una URL accesible
 * desde el browser, respetando el proxy de desarrollo.
 *
 * Django devuelve: "http://backend:8000/media/profiles/foto.jpg"
 * En dev queremos:  "/media/profiles/foto.jpg"   (proxiada por Angular)
 * En prod queremos: "https://api.blackline.mx/media/profiles/foto.jpg"
 */
@Injectable({ providedIn: 'root' })
export class MediaUrlService {
  /**
   * Toma la URL absoluta del backend y la convierte en una URL relativa
   * que funciona con el proxy de Angular dev server.
   */
  resolve(url: string | null | undefined): string | null {
    if (!url) return null;

    if (url.startsWith('data:')) return url;

    // Ya es una URL absoluta — verificar si necesita normalización de host
    try {
      const parsed = new URL(url);
      if (parsed.host.includes('backend') || parsed.host.includes('localhost:8000')) {
        return environment.mediaUrl
          ? `${environment.mediaUrl}${parsed.pathname}`
          : parsed.pathname;
      }
      // URL externa absoluta (Cloudinary, S3, etc.) — devolver tal cual
      return url;
    } catch {
      // No es una URL absoluta válida — es un path relativo del storage backend
    }

    // Path relativo que empieza con /  → devolver tal cual (proxy dev / mismo origen)
    if (url.startsWith('/')) return url;

    // Path relativo sin slash (ej. "profiles/foto.jpg" o "media/profiles/foto.jpg")
    // En producción Cloudinary debe retornar URLs absolutas, así que este caso
    // indica un fallback de storage local — construir URL de media correctamente.
    const base = environment.mediaUrl || '';
    const path = url.startsWith('media/') ? url : `media/${url}`;
    return `${base}/${path}`;
  }
}
