import { Component, inject, effect, ChangeDetectorRef } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [LanguageSelectorComponent, TranslatePipe],
  standalone: true
})
export class NavbarComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
  languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);

  menuOpen = false;

  constructor() {
    // Effect para detectar mudanças no idioma e forçar atualização
    effect(() => {
      this.languageService.currentLanguage();
      this.cdr.markForCheck();
    });
  }

  toggleMenu() {
    this.menuOpen = true;
    document.body.classList.add('menu-mobile-open');
  }

  closeMenu() {
    this.menuOpen = false;
    document.body.classList.remove('menu-mobile-open');
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
