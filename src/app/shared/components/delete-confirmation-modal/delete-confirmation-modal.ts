import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-delete-confirmation-modal',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './delete-confirmation-modal.html',
  styleUrl: './delete-confirmation-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteConfirmationModal {
  isOpen = input<boolean>(false);
  title = input<string>('Delete Item');
  message = input<string>(
    'Are you sure you want to delete this item? This action cannot be undone.'
  );
  itemName = input<string>('');

  onConfirm = output<void>();
  onCancel = output<void>();

  faTrash = faTrash;
  faTimes = faTimes;
}
