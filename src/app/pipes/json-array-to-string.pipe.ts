import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'jsonArrayToString',
  standalone: true
})
export class JsonArrayToStringPipe implements PipeTransform {
  transform(req: string | string[]): string {
    const value = req.toString()
    if (!value) return '';

    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed) && parsed.length > 0) {
        // Retornar apenas a primeira imagem com URL completa
        const firstImage = parsed[0];
        // Se já é uma URL completa, usar diretamente
        if (firstImage.startsWith('http')) {
          return firstImage;
        }
        // Se não é URL completa, construir a URL completa
        return `https://api-ecommerce.maygomes.com${firstImage.startsWith('/') ? '' : '/'}${firstImage}`;
      }

      return String(parsed);
    } catch (e) {
      return value;
    }
  }
}
