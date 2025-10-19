import { ExamItem, ViewExamService } from './../../../view-exam.service';
import {
  Component,
  inject,
  input,
  output,
  signal,
  computed,
  effect,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ExamItemApiService } from '../../../../../services/exam-item-api.service';
import { CommonModule } from '@angular/common';
import {
  faQuestionCircle,
  faStar,
  faToggleOn,
  faExclamationCircle,
  faExclamationTriangle,
  faSave,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-true-or-false-form-modal',
  imports: [ReactiveFormsModule, CommonModule, FaIconComponent],
  templateUrl: './true-or-false-form-modal.html',
  styleUrl: './true-or-false-form-modal.css',
})
export class TrueOrFalseFormModal {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  examItemApi = inject(ExamItemApiService);
  viewExamSvc = inject(ViewExamService);

  // FontAwesome icons
  faQuestionCircle = faQuestionCircle;
  faStar = faStar;
  faToggleOn = faToggleOn;
  faExclamationCircle = faExclamationCircle;
  faExclamationTriangle = faExclamationTriangle;
  faSave = faSave;
  faInfoCircle = faInfoCircle;

  level = input<'easy' | 'moderate' | 'difficult'>('moderate');
  examId = input.required<number>();
  itemToEdit = input<ExamItem | null>(null);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  isModalOpen = input.required<boolean>();
  openModal = output<void>();
  closeModal = output<void>();
  itemSaved = output<ExamItem>();
  isEditMode = computed(() => !!this.itemToEdit());

  tfForm = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3)]],
    answer: ['true', [Validators.required]],
    points: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    effect(() => {
      const item = this.itemToEdit();
      if (item) {
        this.loadItemData(item);
      } else {
        this.resetForm();
      }
    });
  }

  loadItemData(item: ExamItem) {
    this.tfForm.patchValue({
      question: item.question,
      answer: String(item.answer) || 'true',
      points: item.points,
    });
  }

  resetForm() {
    this.tfForm.reset({ question: '', answer: 'true', points: 1 });
  }

  onSubmit() {
    if (this.tfForm.invalid) {
      this.tfForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const answerValue = String(this.tfForm.value.answer);

    const payload = {
      type: 'truefalse',
      question: this.tfForm.value.question!,
      answer: answerValue,
      points: this.tfForm.value.points!,
      level: this.level(),
    };

    const examId = this.examId();
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
          err?.error?.message || 'Failed to save True/False'
        );
        this.isSaving.set(false);
      },
    });
  }
}
