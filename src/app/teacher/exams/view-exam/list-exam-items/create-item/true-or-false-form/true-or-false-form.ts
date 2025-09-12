import { Component, output, signal, inject, input, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment.development';
import { ExamItem } from '../../../../../services/exam-item.service';
import { Exam, ExamService } from '../../../../../services/exam.service';

@Component({
  selector: 'app-true-or-false-form',
  imports: [ReactiveFormsModule],
  templateUrl: './true-or-false-form.html',
  styleUrl: './true-or-false-form.css',
})
export class TrueOrFalseForm implements OnInit {
  private fb = inject(FormBuilder);
  examItemService = inject(ExamService);
  http = inject(HttpClient);
  addItemOutput = output<ExamItem>();

  examIdSig = input.required<number>();
  saving = signal(false);
  errorMsg = signal<string | null>(null);

  tofForm = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3)]],
    answer: ['true', [Validators.required]],
    points: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    console.log('here');
    console.log(this.examItemService.viewingExam());
  }

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

          this.examItemService.viewingExam.update((prev: Exam | null) => {
            console.log(prev);

            if (!prev) return prev;
            return { ...prev, total_points: (prev.total_points ?? 0) + res.item.points };
          });

        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Failed to add True/False');
          this.saving.set(false);
        },
      });
  }
}
