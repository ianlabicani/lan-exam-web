import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.html',
  styleUrl: './error-modal.css',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorModal {
  isOpen = input.required<boolean>();
  message = input.required<string>();
  onClose = output<void>();

  faCircleExclamation = faCircleExclamation;

  closeModal(): void {
    this.onClose.emit();
  }

  onBackdropClick(): void {
    this.closeModal();
  }
}
