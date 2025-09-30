import { Component, inject, input, output, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment.development';
import { ExamItem, ListExamItemsService } from '../../list-exam-items.service';

@Component({
  selector: 'app-matching-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './matching-form-modal.html',
  styleUrl: './matching-form-modal.css',
})
export class MatchingFormModal {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  listExamItemsSvc = inject(ListExamItemsService);

  level = input.required<'easy' | 'moderate' | 'difficult'>();
  examId = input.required<number>();
  isModalOpen = input.required<boolean>();
  openModal = output<void>();
  closeModal = output<void>();

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3)]],
    points: [1, [Validators.required, Validators.min(1)]],
    pairs: this.fb.array(this.initialPairs()),
  });

  initialPairs() {
    return [this.createPair(), this.createPair()];
  }

  get pairs(): FormArray {
    return this.form.get('pairs') as FormArray;
  }

  createPair() {
    return this.fb.nonNullable.group({
      left: ['', Validators.required],
      right: ['', Validators.required],
    });
  }

  addPair() {
    this.pairs.push(this.createPair());
  }

  removePair(i: number) {
    if (this.pairs.length <= 2) return;
    this.pairs.removeAt(i);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const examId = this.examId();
    const payload = {
      type: 'matching',
      question: this.form.value.question!,
      points: this.form.value.points!,
      pairs: this.form.value.pairs!,
      level: this.level(),
    };

    this.http
      .post<{ item: ExamItem }>(
        `${environment.apiBaseUrl}/teacher/exams/${examId}/items`,
        payload
      )
      .subscribe({
        next: (res) => {
          this.listExamItemsSvc.items.update((prev) => [...prev, res.item]);
          this.form.reset({ question: '', points: 1 });
          while (this.pairs.length) this.pairs.removeAt(0);
          this.initialPairs().forEach((p) => this.pairs.push(p));
          this.isSaving.set(false);
          this.closeModal.emit();
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.message || 'Failed to add Matching'
          );
          this.isSaving.set(false);
        },
      });
  }
}
