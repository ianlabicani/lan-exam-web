import { Component, inject, input, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ExamItemsService } from '../../exam-items.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment.development';
import { ExamItem } from '../../../../../services/exam-item.service';

@Component({
  selector: 'app-essay-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './essay-form.html',
  styleUrl: './essay-form.css',
})
export class EssayForm {
  protected examItemsService = inject(ExamItemsService);
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
        },
        error: (error) => {
          console.error('Error creating essay item:', error);
          this.isSavingSig.set(false);
        },
      });
  }
}
