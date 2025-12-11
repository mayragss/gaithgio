import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private cache: Map<string, string> = new Map();
  private translationApiUrl = 'https://api.mymemory.translated.net/get';

  constructor(private http: HttpClient) {}

  /**
   * Traduz texto de português para inglês
   * Usa cache para evitar chamadas repetidas à API
   */
  translatePtToEn(text: string): Observable<string> {
    if (!text || text.trim() === '') {
      return of('');
    }

    // Verifica se já está em cache
    const cacheKey = `pt_en_${text}`;
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    // Faz a requisição à API de tradução
    const params = {
      q: text,
      langpair: 'pt|en'
    };

    return this.http.get<any>(this.translationApiUrl, { params }).pipe(
      map(response => {
        if (response && response.responseData && response.responseData.translatedText) {
          const translated = response.responseData.translatedText;
          // Armazena no cache
          this.cache.set(cacheKey, translated);
          return translated;
        }
        // Se a API falhar, retorna o texto original
        return text;
      }),
      catchError(error => {
        console.warn('Erro ao traduzir texto:', error);
        // Em caso de erro, retorna o texto original
        return of(text);
      })
    );
  }

  /**
   * Traduz texto de forma síncrona se estiver em cache, caso contrário retorna o texto original
   * Útil para uso em templates
   */
  translatePtToEnSync(text: string): string {
    if (!text || text.trim() === '') {
      return '';
    }

    const cacheKey = `pt_en_${text}`;
    return this.cache.get(cacheKey) || text;
  }

  /**
   * Limpa o cache de traduções
   */
  clearCache(): void {
    this.cache.clear();
  }
}


