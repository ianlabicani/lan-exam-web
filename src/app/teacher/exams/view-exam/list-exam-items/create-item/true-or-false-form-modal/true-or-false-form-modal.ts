import {
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment.development';
import {
  ExamItem,
  ExamItemService,
} from '../../../../../services/exam-item.service';

@Component({
  selector: 'app-true-or-false-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './true-or-false-form-modal.html',
  styleUrl: './true-or-false-form-modal.css',
})
export class TrueOrFalseFormModal {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  examItemService = inject(ExamItemService);

  level = input.required<'easy' | 'moderate' | 'difficult'>();
  examId = input.required<number>();
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  isModalOpen = input.required<boolean>();
  openModal = output<void>();
  closeModal = output<void>();

  tfForm = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3)]],
    answer: ['true', [Validators.required]],
    points: [1, [Validators.required, Validators.min(1)]],
  });

  onSubmit() {
    if (this.tfForm.invalid) {
      this.tfForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const payload = {
      type: 'truefalse',
      question: this.tfForm.value.question!,
      answer: this.tfForm.value.answer!,
      points: this.tfForm.value.points!,
      level: this.level(),
    };

    const examId = this.examId();
    this.http
      .post<{ item: ExamItem }>(
        `${environment.apiBaseUrl}/teacher/exams/${examId}/items`,
        payload
      )
      .subscribe({
        next: (res) => {
          this.examItemService.items.update((prev) => [...prev, res.item]);
          this.tfForm.reset({ question: '', answer: 'true', points: 1 });
          this.isSaving.set(false);
          this.closeModal.emit();
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.message || 'Failed to add True/False'
          );
          this.isSaving.set(false);
        },
      });
  }
}
