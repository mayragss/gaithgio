import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'jsonArrayToString',
  standalone: true
})
export class JsonArrayToStringPipe implements PipeTransform {
  transform(req: string | string[]): string {
    if (!req || (Array.isArray(req) && req.length === 0)) return '';

    // Se já é um array, usa diretamente
    if (Array.isArray(req)) {
      const firstImage = req[0];
      return this.buildUrl(firstImage);
    }

    // Se é string, tenta parsear
    try {
      const parsed = JSON.parse(req);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return this.buildUrl(parsed[0]);
      }
    } catch (e) {
      console.warn('JsonArrayToStringPipe: erro ao parsear', e);
    }

    return '';
  }

  private buildUrl(image: string): string {
    if (!image) return '';
    if (image.includes('http')) return image;
    return `https://api-ecommerce.maygomes.com${image.startsWith('/') ? '' : '/'}${image}`;
  }
}
