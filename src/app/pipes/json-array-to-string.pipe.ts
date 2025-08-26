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

      if (Array.isArray(parsed)) {
        return parsed.join(', '); 
      }

      return String(parsed);
    } catch (e) {
      return value;
    }
  }
}
