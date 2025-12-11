import { Component, Input, Output, EventEmitter, inject, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-whatsapp-confirmation',
  standalone: true,
  imports: [CommonModule, Button, TranslatePipe],
  templateUrl: './whatsapp-confirmation.component.html',
  styleUrls: ['./whatsapp-confirmation.component.scss']
})
export class WhatsAppConfirmationComponent {
  @Input() firstName: string = '';
  @Input() orderNumber?: string;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  
  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // Effect para detectar mudanças no idioma e forçar atualização
    effect(() => {
      this.languageService.currentLanguage();
      this.cdr.markForCheck();
    });
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

