import { Component, inject, effect, ChangeDetectorRef } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { LanguageService } from '../../services/language.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'size-chart',
  imports: [NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './size-chart.component.html',
  styleUrls: ['./size-chart.component.scss']
})
export class SizeChartComponent {
  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);
  
  get currentLanguage(): 'pt' | 'en' {
    return this.languageService.currentLanguage();
  }

  constructor() {
    // Effect para detectar mudanças no idioma e forçar atualização
    effect(() => {
      this.languageService.currentLanguage();
      this.cdr.markForCheck();
    });
  }
}

