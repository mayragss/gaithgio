import { Component, inject } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'footer',
  imports: [TranslatePipe, CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  private languageService = inject(LanguageService);
  
  getWhatsAppHelpUrl(): string {
    const currentLang = this.languageService.currentLanguage();
    const message = currentLang === 'pt' 
      ? 'Olá! Estou a precisar de ajuda no site Gaithgio. Poderiam me orientar?'
      : 'Hello! I need help on the Gaithgio website. Could you help me?';
    return `https://wa.me/351934036467?text=${encodeURIComponent(message)}`;
  }
}
