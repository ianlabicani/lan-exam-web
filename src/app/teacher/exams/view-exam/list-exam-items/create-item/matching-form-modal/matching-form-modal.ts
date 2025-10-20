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
import { ExamItem, ViewExamService } from '../../../view-exam.service';
import { ExamItemApiService } from '../../../../../services/exam-item-api.service';
import {
  faQuestionCircle,
  faStar,
  faSignal,
  faLink,
  faArrowLeft,
  faArrowRight,
  faInfoCircle,
  faArrowsAltH,
  faTimes,
  faPlusCircle,
  faExclamationTriangle,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-matching-form-modal',
  imports: [ReactiveFormsModule, CommonModule, FaIconComponent],
  templateUrl: './matching-form-modal.html',
  styleUrl: './matching-form-modal.css',
})
export class MatchingFormModal {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  examItemApi = inject(ExamItemApiService);
  viewExamSvc = inject(ViewExamService);

  // FontAwesome icons
  faQuestionCircle = faQuestionCircle;
  faStar = faStar;
  faSignal = faSignal;
  faLink = faLink;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  faInfoCircle = faInfoCircle;
  faArrowsAltH = faArrowsAltH;
  faTimes = faTimes;
  faPlusCircle = faPlusCircle;
  faExclamationTriangle = faExclamationTriangle;
  faSave = faSave;

  level = input<'easy' | 'moderate' | 'difficult'>('moderate');
  examId = input.required<number>();
  topic = input<string>('');
  isModalOpen = input.required<boolean>();
  itemToEdit = input<ExamItem | null>(null);
  openModal = output<void>();
  closeModal = output<void>();
  itemSaved = output<ExamItem>();

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  pairCount = signal(2);
  isEditMode = computed(() => !!this.itemToEdit());

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
    // Load form data when item to edit changes
    effect(() => {
      const item = this.itemToEdit();
      if (item) {
        this.loadItemData(item);
      } else {
        this.resetForm();
      }
    });

    // Auto-update points when pairs change
    effect(() => {
      const pairCount = this.pairCount();
      this.form.get('points')?.setValue(pairCount, { emitEvent: false });
    });
  }

  loadItemData(item: ExamItem) {
    this.form.patchValue({
      question: item.question,
      points: item.points,
    });

    // Clear existing pairs
    while (this.pairs.length) this.pairs.removeAt(0);

    // Load pairs from item
    if (item.pairs && Array.isArray(item.pairs)) {
      item.pairs.forEach((p: any) => {
        this.pairs.push(
          this.fb.nonNullable.group({
            left: [p.left || '', Validators.required],
            right: [p.right || '', Validators.required],
          })
        );
      });
    } else {
      this.pairs.push(this.createPair());
      this.pairs.push(this.createPair());
    }

    this.pairCount.set(this.pairs.length);
  }

  resetForm() {
    this.form.reset({ question: '', points: 2 });
    while (this.pairs.length) this.pairs.removeAt(0);
    this.initialPairs().forEach((p) => this.pairs.push(p));
    this.pairCount.set(2);
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
      topic: this.topic(),
    };

    const isEdit = this.isEditMode();
    const itemId = isEdit ? this.itemToEdit()?.id : null;

    (isEdit && itemId
      ? this.examItemApi.updateItem(examId, itemId, payload)
      : this.examItemApi.create(examId, payload)
    ).subscribe({
      next: (res: { data: ExamItem }) => {
        const item = res.data;

        if (isEdit) {
          this.viewExamSvc.updateItem(item);
        } else {
          this.viewExamSvc.addItem(item);
        }

        this.itemSaved.emit(item);
        this.resetForm();
        this.isSaving.set(false);
        this.closeModal.emit();
      },
      error: (err: any) => {
        this.errorMessage.set(
          err?.error?.message || 'Failed to save matching question'
        );
        this.isSaving.set(false);
      },
    });
  }
}
