import { Exam, ExamService } from './../../../../services/exam.service';
import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamItem, ListExamItemsService } from '../list-exam-items.service';

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

  examItemsSvc = inject(ListExamItemsService);
  examService = inject(ExamService);

  deleting = false;
  error: string | null = null;

  confirmDelete() {
    const item = this.itemInput();
    if (!item) return;
    this.deleting = true;
    this.error = null;

    this.examItemsSvc.delete(item.id).subscribe({
      next: (res) => {
        this.deleting = false;
        this.deleted.emit(item);
        this.examService.viewingExam.update((prev: Exam | null) => {
          if (!prev) return prev;
          return {
            ...prev,
            total_points: (prev.total_points ?? 0) - item.points,
          };
        });
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
