import { Component, inject, effect, ChangeDetectorRef } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'home',
  imports: [ButtonModule, NavbarComponent, FooterComponent, TranslatePipe, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true
})
export class HomeComponent {
  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // Effect para detectar mudanças no idioma e forçar atualização
    effect(() => {
      this.languageService.currentLanguage();
      this.cdr.markForCheck();
    });
  }
}
