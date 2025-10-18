import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExamItem, ViewExamService } from '../../../view-exam.service';
import { ExamItemApiService } from '../../../../../services/exam-item-api.service';

@Component({
  selector: 'app-essay-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './essay-form-modal.html',
  styleUrl: './essay-form-modal.css',
})
export class EssayFormModal {
  viewExamSvc = inject(ViewExamService);
  examItemApi = inject(ExamItemApiService);
  fb = inject(FormBuilder);

  level = input.required<'easy' | 'moderate' | 'difficult'>();
  close = output<void>();
  isSaving = signal(false);
  examId = input.required<number>();
  errorMessage = signal<string | null>(null);
  isModalOpen = input.required<boolean>();
  openModal = output<void>();
  closeModal = output<void>();

  essayForm = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3)]],
    expected_answer: ['', [Validators.required]],
    points: [1, [Validators.required, Validators.min(1)]],
    type: 'essay',
  });

  onSubmit() {
    if (this.essayForm.invalid) {
      this.essayForm.markAllAsTouched();
      return;
    }

    this.createEssayItem();
  }

  createEssayItem() {
    if (this.essayForm.invalid) {
      this.essayForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);

    const newItem = this.essayForm.getRawValue();
    const examId = this.examId();

    this.examItemApi
      .create(examId, { ...newItem, level: this.level() })
      .subscribe({
        next: (res: { data: ExamItem }) => {
          this.viewExamSvc.addItem(res.data);

          this.essayForm.reset();
          this.isSaving.set(false);
          this.closeModal.emit();
        },
        error: (error: any) => {
          console.error('Error creating essay item:', error);
          this.isSaving.set(false);
          this.errorMessage.set(
            'Failed to create essay item. Please try again.'
          );
        },
      });
  }
}
