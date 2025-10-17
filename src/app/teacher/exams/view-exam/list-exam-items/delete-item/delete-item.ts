import { Exam } from './../../../../services/exam.service';
import { ViewExamService } from '../../view-exam.service';
import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamItem } from '../exam-item-state.service';

@Component({
  selector: 'app-delete-item',
  imports: [CommonModule],
  templateUrl: './delete-item.html',
  styleUrl: './delete-item.css',
})
export class DeleteItem {
  itemInput = input.required<ExamItem>();
  exam = input.required<Exam>();
  deleted = output<ExamItem>();
  close = output<void>();

  viewExamSvc = inject(ViewExamService);

  deleting = false;
  error: string | null = null;

  confirmDelete() {
    const item = this.itemInput();
    const exam = this.exam();
    if (!item || !exam) return;
    this.deleting = true;
    this.error = null;

    this.viewExamSvc.deleteItem(exam.id, item.id).subscribe({
      next: (res) => {
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
