import { Component, inject, ChangeDetectorRef, effect } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.component.html',
  styleUrl: 'language-selector.component.scss'
})
export class LanguageSelectorComponent {
  languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // Effect para detectar mudanças no idioma e forçar atualização
    effect(() => {
      this.languageService.currentLanguage();
      this.cdr.markForCheck();
    });
  }

  getFlagEmoji(): string {
    return this.languageService.currentLanguage() === 'en' ? 'US.svg' : 'BR.svg';
  }

  toggleLanguage() {
    this.languageService.toggleLanguage();
    // Força a detecção de mudanças em toda a aplicação
    this.cdr.detectChanges();
  }
}

