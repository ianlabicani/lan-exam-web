import { Component, inject, input, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment.development';
import { ExamItem } from '../../../../../services/exam-item.service';
import { Exam, ExamService } from '../../../../../services/exam.service';

@Component({
  selector: 'app-essay-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './essay-form.html',
  styleUrl: './essay-form.css',
})
export class EssayForm {
  protected examService = inject(ExamService);
  private fb = inject(FormBuilder);
  http = inject(HttpClient);

  addItemOutput = output<ExamItem>();

  examIdSig = input<number | null>();
  isSavingSig = signal(false);

  essayForm = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3)]],
    expected_answer: ['', [Validators.required]],
    points: [1, [Validators.required, Validators.min(1)]],
    type: 'essay',
  });

  createEssayItem() {
    this.isSavingSig.set(true);
    if (this.essayForm.invalid) {
      this.essayForm.markAllAsTouched();
      return;
    }

    const newItem = this.essayForm.getRawValue();
    const payload = {
      ...newItem,
      type: 'essay',
    };

    this.http
      .post<{ item: ExamItem }>(
        `${environment.apiBaseUrl}/teacher/exams/${this.examIdSig()}/items`,
        payload
      )
      .subscribe({
        next: (res) => {
          this.essayForm.reset();
          this.addItemOutput.emit(res.item);
          this.isSavingSig.set(false);
          this.examService.viewingExam.update((prev: Exam | null) => {
            if (!prev) return prev;
            return { ...prev, total_points: (prev.total_points ?? 0) + res.item.points };
          });
        },
        error: (error) => {
          console.error('Error creating essay item:', error);
          this.isSavingSig.set(false);
        },
      });
  }
}
