import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { translations } from '../translations/translations';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Torna o pipe impuro para detectar mudanças
})
export class TranslatePipe implements PipeTransform {
  private languageService = inject(LanguageService);

  transform(key: string): string {
    // Lê o signal diretamente - isso força a reatividade
    const currentLang = this.languageService.currentLanguage();
    const translation = translations[key];
    
    if (!translation) {
      console.warn(`Translation key "${key}" not found`);
      return key;
    }
    
    return translation[currentLang] || key;
  }
}

