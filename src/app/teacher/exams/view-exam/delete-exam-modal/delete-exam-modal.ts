import {
  Component,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  faTrash,
  faTimes,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-delete-exam-modal',
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  templateUrl: './delete-exam-modal.html',
  styleUrl: './delete-exam-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteExamModalComponent {
  examTitle = input<string>('');
  isOpen = input<boolean>(false);
  isDeleting = input<boolean>(false);

  closeModal = output<void>();
  confirmDelete = output<void>();

  faTrash = faTrash;
  faTimes = faTimes;
  faExclamationTriangle = faExclamationTriangle;

  onClose(): void {
    this.closeModal.emit();
  }

  onConfirm(): void {
    this.confirmDelete.emit();
  }
}
