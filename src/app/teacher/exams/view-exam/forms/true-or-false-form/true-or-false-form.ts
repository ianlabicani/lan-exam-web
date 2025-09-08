import { Component, Input, output, signal, inject, input } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ExamService } from '../../../exam.service';

@Component({
  selector: 'app-true-or-false-form',
  imports: [ReactiveFormsModule],
  templateUrl: './true-or-false-form.html',
  styleUrl: './true-or-false-form.css',
})
export class TrueOrFalseForm {
  private fb = inject(FormBuilder);
  private examService = inject(ExamService);
  // protected viewExamItemsService = inject(ViewExamItemsService);

  examIdSig = input<number | null>(null);
  saving = signal(false);
  errorMsg = signal<string | null>(null);

  tofForm = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3)]],
    answer: ['true', [Validators.required]],
    points: [1, [Validators.required, Validators.min(1)]],
  });

  createItem() {
    if (this.tofForm.invalid || !this.examIdSig) return;

    const examId = this.examIdSig() ?? 0;
    this.saving.set(true);
    this.errorMsg.set(null);
    const tofFormVal = this.tofForm.getRawValue();
    this.examService
      .createItem(examId, {
        type: 'truefalse',
        question: tofFormVal.question.trim(),
        points: tofFormVal.points || 1,
        answer: tofFormVal.answer === 'true',
      })
      .subscribe({
        next: (res) => {
          this.tofForm.reset({ question: '', answer: 'true', points: 1 });
          this.saving.set(false);
          // this.viewExamItemsService.addItem(res.item);
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Failed to add True/False');
          this.saving.set(false);
        },
      });
  }
}
