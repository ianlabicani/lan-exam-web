import {
  ExamItem,
  ViewExamService,
  ViewingExam,
} from '../../view-exam.service';
import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamItemApiService } from '../../../../services/exam-item-api.service';

@Component({
  selector: 'app-delete-item',
  imports: [CommonModule],
  templateUrl: './delete-item.html',
  styleUrl: './delete-item.css',
})
export class DeleteItem {
  itemInput = input.required<ExamItem>();
  exam = input.required<ViewingExam>();
  close = output<void>();

  examItemApi = inject(ExamItemApiService);
  viewExamSvc = inject(ViewExamService);

  deleting = false;
  error: string | null = null;

  confirmDelete() {
    const item = this.itemInput();
    const exam = this.exam();
    if (!item || !exam) return;
    this.deleting = true;
    this.error = null;

    this.examItemApi.deleteItem(exam.id, item.id).subscribe({
      next: (res) => {
        this.deleting = false;
        this.viewExamSvc.removeItem(item.id);
        this.close.emit();
      },
      error: (err: any) => {
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
