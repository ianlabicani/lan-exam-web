import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamItemsService } from '../exam-items.service';
import { IExamItem } from '../list-exam-items';

@Component({
  selector: 'app-delete-item',
  imports: [CommonModule],
  templateUrl: './delete-item.html',
  styleUrl: './delete-item.css',
})
export class DeleteItem {
  itemInput = input.required<IExamItem>();
  deleted = output<IExamItem>();
  close = output<void>();

  examItemsService = inject(ExamItemsService);

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
