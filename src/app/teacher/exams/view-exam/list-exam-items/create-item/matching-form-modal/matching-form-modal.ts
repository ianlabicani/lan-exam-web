import {
  Component,
  inject,
  input,
  output,
  signal,
  computed,
  effect,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../../../environments/environment.development';
import { ExamItem, ListExamItemsService } from '../../list-exam-items.service';
import { ViewExamService } from '../../../view-exam.service';

@Component({
  selector: 'app-matching-form-modal',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './matching-form-modal.html',
  styleUrl: './matching-form-modal.css',
})
export class MatchingFormModal {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  listExamItemsSvc = inject(ListExamItemsService);
  viewExamSvc = inject(ViewExamService);

  level = input.required<'easy' | 'moderate' | 'difficult'>();
  examId = input.required<number>();
  isModalOpen = input.required<boolean>();
  openModal = output<void>();
  closeModal = output<void>();

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  pairCount = signal(2);

  form = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3)]],
    points: [
      { value: 2, disabled: true },
      [Validators.required, Validators.min(1)],
    ],
    pairs: this.fb.array(this.initialPairs()),
  });

  initialPairs() {
    return [this.createPair(), this.createPair()];
  }

  get pairs(): FormArray {
    return this.form.get('pairs') as FormArray;
  }

  constructor() {
    // Auto-update points when pairs change
    effect(() => {
      const pairCount = this.pairCount();
      this.form.get('points')?.setValue(pairCount, { emitEvent: false });
    });
  }

  createPair() {
    return this.fb.nonNullable.group({
      left: ['', Validators.required],
      right: ['', Validators.required],
    });
  }

  addPair() {
    this.pairs.push(this.createPair());
    this.pairCount.set(this.pairs.length);
  }

  removePair(i: number) {
    if (this.pairs.length <= 2) return;
    this.pairs.removeAt(i);
    this.pairCount.set(this.pairs.length);
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
      points: this.pairCount(),
      pairs: this.form.value.pairs!,
      level: this.level(),
    };

    this.viewExamSvc.createItem(examId, payload).subscribe({
      next: (res) => {
        this.form.reset({ question: '', points: 2 });
        while (this.pairs.length) this.pairs.removeAt(0);
        this.initialPairs().forEach((p) => this.pairs.push(p));
        this.pairCount.set(2);
        this.isSaving.set(false);
        this.closeModal.emit();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to add Matching');
        this.isSaving.set(false);
      },
    });
  }
}
