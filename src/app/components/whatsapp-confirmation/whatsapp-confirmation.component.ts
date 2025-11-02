import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-whatsapp-confirmation',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './whatsapp-confirmation.component.html',
  styleUrls: ['./whatsapp-confirmation.component.scss']
})
export class WhatsAppConfirmationComponent {
  @Input() firstName: string = '';
  @Input() orderNumber?: string;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

