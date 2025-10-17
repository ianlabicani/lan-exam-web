import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment.development';
import { ExamItem, ListExamItemsService } from '../../list-exam-items.service';
import { ViewExamService } from '../../../view-exam.service';

@Component({
  selector: 'app-short-answer-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './short-answer-form-modal.html',
  styleUrl: './short-answer-form-modal.css',
})
export class ShortAnswerFormModal {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  listExamItemsSvc = inject(ListExamItemsService);
  viewExamSvc = inject(ViewExamService);

  level = input.required<'easy' | 'moderate' | 'difficult'>();
  examId = input.required<number>();
  isModalOpen = input.required<boolean>();
  openModal = output<void>();
  closeModal = output<void>();

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3)]],
    expected_answer: ['', [Validators.required]],
    points: [1, [Validators.required, Validators.min(1)]],
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const examId = this.examId();
    const payload = {
      type: 'shortanswer',
      question: this.form.value.question!,
      expected_answer: this.form.value.expected_answer!,
      points: this.form.value.points!,
      level: this.level(),
    };

    this.viewExamSvc.createItem(examId, payload).subscribe({
      next: (res) => {
        this.form.reset({ question: '', expected_answer: '', points: 1 });
        this.isSaving.set(false);
        this.closeModal.emit();
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Failed to add Short Answer'
        );
        this.isSaving.set(false);
      },
    });
  }
}
