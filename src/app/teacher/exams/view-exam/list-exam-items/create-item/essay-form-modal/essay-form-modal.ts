import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { ViewExamService } from '../../../view-exam.service';
import { ExamItem } from '../../exam-item-state.service';

@Component({
  selector: 'app-essay-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './essay-form-modal.html',
  styleUrl: './essay-form-modal.css',
})
export class EssayFormModal {
  viewExamSvc = inject(ViewExamService);
  fb = inject(FormBuilder);
  http = inject(HttpClient);

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

    this.viewExamSvc
      .createItem(examId, { ...newItem, level: this.level() })
      .subscribe({
        next: (res) => {
          this.essayForm.reset();
          this.isSaving.set(false);
          this.closeModal.emit();
        },
        error: (error) => {
          console.error('Error creating essay item:', error);
          this.isSaving.set(false);
          this.errorMessage.set(
            'Failed to create essay item. Please try again.'
          );
        },
      });
  }
}
