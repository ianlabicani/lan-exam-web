import {
  Component,
  inject,
  input,
  output,
  signal,
  computed,
  effect,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment.development';
import { ExamItem, ViewExamService } from '../../../view-exam.service';
import { ExamItemApiService } from '../../../../../services/exam-item-api.service';
import { CommonModule } from '@angular/common';
import {
  faQuestionCircle,
  faStar,
  faKeyboard,
  faExclamationCircle,
  faExclamationTriangle,
  faSave,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-short-answer-form-modal',
  imports: [ReactiveFormsModule, CommonModule, FaIconComponent],
  templateUrl: './short-answer-form-modal.html',
  styleUrl: './short-answer-form-modal.css',
})
export class ShortAnswerFormModal {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  examItemApi = inject(ExamItemApiService);
  viewExamSvc = inject(ViewExamService);

  // FontAwesome icons
  faQuestionCircle = faQuestionCircle;
  faStar = faStar;
  faKeyboard = faKeyboard;
  faExclamationCircle = faExclamationCircle;
  faExclamationTriangle = faExclamationTriangle;
  faSave = faSave;
  faInfoCircle = faInfoCircle;

  level = input<'easy' | 'moderate' | 'difficult'>('moderate');
  examId = input.required<number>();
  itemToEdit = input<ExamItem | null>(null);
  isModalOpen = input.required<boolean>();
  openModal = output<void>();
  closeModal = output<void>();
  itemSaved = output<ExamItem>();
  isEditMode = computed(() => !!this.itemToEdit());

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3)]],
    expected_answer: ['', [Validators.required]],
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
    this.form.patchValue({
      question: item.question,
      expected_answer: item.expected_answer || '',
      points: item.points,
    });
  }

  resetForm() {
    this.form.reset({ question: '', expected_answer: '', points: 1 });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const examId = this.examId();
    const isEdit = this.isEditMode();
    const itemId = isEdit ? this.itemToEdit()?.id : null;

    const payload = {
      type: 'shortanswer',
      question: this.form.value.question!,
      expected_answer: this.form.value.expected_answer!,
      points: this.form.value.points!,
      level: this.level(),
    };

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
          err?.error?.message || 'Failed to save Short Answer'
        );
        this.isSaving.set(false);
      },
    });
  }
}
