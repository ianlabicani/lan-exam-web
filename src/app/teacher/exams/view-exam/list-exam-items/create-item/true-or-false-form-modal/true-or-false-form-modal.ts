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
import { ExamItem } from '../../exam-item-state.service';
import { ViewExamService } from '../../../view-exam.service';
import { ExamApiService } from '../../../../services/exam-api.service';

@Component({
  selector: 'app-true-or-false-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './true-or-false-form-modal.html',
  styleUrl: './true-or-false-form-modal.css',
})
export class TrueOrFalseFormModal {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  examApiSvc = inject(ExamApiService);
  viewExamSvc = inject(ViewExamService);

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

    // The answer field expects a STRING: 'true' or 'false'
    const answerValue = String(this.tfForm.value.answer);

    const payload = {
      type: 'truefalse',
      question: this.tfForm.value.question!,
      answer: answerValue,
      points: this.tfForm.value.points!,
      level: this.level(),
    };

    const examId = this.examId();
    this.examApiSvc.createItem(examId, payload).subscribe({
      next: (res: any) => {
        // Update parent state with new exam data
        this.viewExamSvc.patchViewingExam(res.data);

        this.tfForm.reset({ question: '', answer: 'true', points: 1 });
        this.isSaving.set(false);
        this.closeModal.emit();
      },
      error: (err: any) => {
        this.errorMessage.set(
          err?.error?.message || 'Failed to add True/False'
        );
        this.isSaving.set(false);
      },
    });
  }
}
