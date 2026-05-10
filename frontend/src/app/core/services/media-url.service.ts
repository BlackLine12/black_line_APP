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

    // Si ya empieza con /, asumimos que es correcto (ya sea /media/... o /api/media/...)
    if (url.startsWith('/')) return url;

    // Si es una URL completa (http...)
    try {
      const parsed = new URL(url);
      // Si el host es 'backend' o localhost:8000, lo normalizamos
      if (parsed.host.includes('backend') || parsed.host.includes('localhost:8000')) {
        return environment.mediaUrl
          ? `${environment.mediaUrl}${parsed.pathname}`
          : parsed.pathname;
      }
      return url; // URL externa (S3, Cloudinary, etc.)
    } catch {
      // Si no es una URL válida y no empieza con /, podría ser un path relativo (profiles/pic.jpg)
      // O un data:image (que devolvemos tal cual)
      if (url.startsWith('data:')) return url;
      
      const mediaPrefix = environment.mediaUrl || '/media';
      return url.startsWith('media/') 
        ? `${environment.mediaUrl || ''}/${url}`
        : `${mediaPrefix}/${url}`;
    }
  }
}
