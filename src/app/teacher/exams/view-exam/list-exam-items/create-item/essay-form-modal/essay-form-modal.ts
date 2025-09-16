import { ExamService } from './../../../../../services/exam.service';
import {
  ExamItem,
  ExamItemService,
} from './../../../../../services/exam-item.service';
import { Component, inject, input, output, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EssayFormModalService } from './essay-form-modal.service';
import { Exam } from '../../../../../services/exam.service';
import { environment } from '../../../../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-essay-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './essay-form-modal.html',
  styleUrl: './essay-form-modal.css',
})
export class EssayFormModal {
  fb = inject(FormBuilder);
  essayFormModalService = inject(EssayFormModalService);
  http = inject(HttpClient);
  examItemService = inject(ExamItemService);

  isModalOpen = input(false);
  close = output<void>();
  isSaving = signal(false);
  examId = input.required<number>();
  errorMessage = signal<string | null>(null);

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
      console.log('Form is invalid');

      this.essayForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);

    const newItem = this.essayForm.getRawValue();
    const examId = this.examId();

    this.http
      .post<{ item: ExamItem }>(
        `${environment.apiBaseUrl}/teacher/exams/${examId}/items`,
        newItem
      )
      .subscribe({
        next: (res) => {
          this.essayForm.reset();
          this.examItemService.items.update((prev) => [...prev, res.item]);
          console.log('Essay item created:', res.item);
          console.log(this.examItemService.items());

          this.isSaving.set(false);
          this.essayFormModalService.closeModal();
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
