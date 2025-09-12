import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamItem, ExamItemService } from '../../../../services/exam-item.service';

@Component({
  selector: 'app-delete-item',
  imports: [CommonModule],
  templateUrl: './delete-item.html',
  styleUrl: './delete-item.css',
})
export class DeleteItem {
  itemInput = input.required<ExamItem>();
  deleted = output<ExamItem>();
  close = output<void>();

  examItemsService = inject(ExamItemService);

  deleting = false;
  error: string | null = null;

  confirmDelete() {
    const item = this.itemInput();
    if (!item) return;
    this.deleting = true;
    this.error = null;

    this.examItemsService.delete(item.exam_id, item.id).subscribe({
      next: () => {
        this.deleting = false;
        this.deleted.emit(item);
      },
      error: (err) => {
        this.deleting = false;
        this.error = 'Failed to delete item';
        console.error('Delete item error', err);
      },
    });
  }

  onClose() {
    this.close.emit();
  }
}
