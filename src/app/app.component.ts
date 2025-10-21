import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { Toast } from "primeng/toast";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Toast],
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gaithgio';
  constructor(private primeng: PrimeNG) { }

  ngOnInit() {
    this.primeng.ripple.set(true);
    this.loadFonts();
  }

  private loadFonts() {
    // Check if fonts are already loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        document.body.classList.add('font-loaded');
        document.body.classList.remove('font-loading');
      });
    } else {
      // Fallback for older browsers
      setTimeout(() => {
        document.body.classList.add('font-loaded');
        document.body.classList.remove('font-loading');
      }, 100);
    }
  }
}
