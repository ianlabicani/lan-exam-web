import { Component, output, signal, inject, input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ExamItemsService } from '../../exam-items.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment.development';
import { ExamItem } from '../../../../../services/exam-item.service';

@Component({
  selector: 'app-true-or-false-form',
  imports: [ReactiveFormsModule],
  templateUrl: './true-or-false-form.html',
  styleUrl: './true-or-false-form.css',
})
export class TrueOrFalseForm {
  private fb = inject(FormBuilder);
  examItemsService = inject(ExamItemsService);
  http = inject(HttpClient);
  addItemOutput = output<ExamItem>();

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
    const payload = {
      type: 'truefalse',
      question: tofFormVal.question.trim(),
      points: tofFormVal.points || 1,
      answer: tofFormVal.answer === 'true',
    };

    this.http
      .post<{ item: ExamItem }>(
        `${environment.apiBaseUrl}/teacher/exams/${examId}/items`,
        payload
      )
      .subscribe({
        next: (res) => {
          this.tofForm.reset({ question: '', answer: 'true', points: 1 });
          this.saving.set(false);
          this.addItemOutput.emit(res.item);
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Failed to add True/False');
          this.saving.set(false);
        },
      });
  }
}
