import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment.development';
import {
  ExamItem,
  ExamItemService,
} from '../../../../../services/exam-item.service';

@Component({
  selector: 'app-fill-blank-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './fill-blank-form-modal.html',
  styleUrl: './fill-blank-form-modal.css',
})
export class FillBlankFormModal {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  examItemService = inject(ExamItemService);

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
      type: 'fill_blank',
      question: this.form.value.question!,
      expected_answer: this.form.value.expected_answer!,
      points: this.form.value.points!,
      level: this.level(),
    };

    this.http
      .post<{ item: ExamItem }>(
        `${environment.apiBaseUrl}/teacher/exams/${examId}/items`,
        payload
      )
      .subscribe({
        next: (res) => {
          this.examItemService.items.update((prev) => [...prev, res.item]);
          this.form.reset({ question: '', expected_answer: '', points: 1 });
          this.isSaving.set(false);
          this.closeModal.emit();
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.message || 'Failed to add Fill in the Blank'
          );
          this.isSaving.set(false);
        },
      });
  }
}
