import { Injectable, signal, computed } from '@angular/core';

export type Language = 'pt' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private languageKey = 'gaithgio_language';
  
  // Signal para o idioma atual
  private _currentLanguage = signal<Language>(this.getInitialLanguage());
  
  // Computed para acessar o idioma atual
  currentLanguage = computed(() => this._currentLanguage());

  constructor() {
    // Carrega o idioma salvo do localStorage
    const savedLanguage = localStorage.getItem(this.languageKey);
    if (savedLanguage === 'pt' || savedLanguage === 'en') {
      this._currentLanguage.set(savedLanguage as Language);
    }
  }

  private getInitialLanguage(): Language {
    const saved = localStorage.getItem(this.languageKey);
    return (saved === 'pt' || saved === 'en') ? saved as Language : 'pt';
  }

  setLanguage(language: Language) {
    this._currentLanguage.set(language);
    localStorage.setItem(this.languageKey, language);
  }

  toggleLanguage() {
    const newLanguage = this._currentLanguage() === 'pt' ? 'en' : 'pt';
    this.setLanguage(newLanguage);
  }

  getLanguage(): Language {
    return this._currentLanguage();
  }
}


