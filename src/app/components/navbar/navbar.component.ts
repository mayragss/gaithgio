import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);

  menuOpen = false;

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
