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
import { ExamItem, ViewExamService } from '../../../view-exam.service';
import { ExamItemApiService } from '../../../../../services/exam-item-api.service';
import { CommonModule } from '@angular/common';
import {
  faQuestionCircle,
  faStar,
  faLightbulb,
  faExclamationCircle,
  faExclamationTriangle,
  faSave,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-essay-form-modal',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './essay-form-modal.html',
  styleUrl: './essay-form-modal.css',
})
export class EssayFormModal {
  viewExamSvc = inject(ViewExamService);
  examItemApi = inject(ExamItemApiService);
  fb = inject(FormBuilder);

  // FontAwesome icons
  faQuestionCircle = faQuestionCircle;
  faStar = faStar;
  faLightbulb = faLightbulb;
  faExclamationCircle = faExclamationCircle;
  faExclamationTriangle = faExclamationTriangle;
  faSave = faSave;
  faInfoCircle = faInfoCircle;

  level = input<'easy' | 'moderate' | 'difficult'>('moderate');
  examId = input.required<number>();
  topic = input<string>('');
  itemToEdit = input<ExamItem | null>(null);
  close = output<void>();
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  isModalOpen = input.required<boolean>();
  openModal = output<void>();
  closeModal = output<void>();
  itemSaved = output<ExamItem>();
  isEditMode = computed(() => !!this.itemToEdit());

  essayForm = this.fb.nonNullable.group({
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
    this.essayForm.patchValue({
      question: item.question,
      expected_answer: item.expected_answer || '',
      points: item.points,
    });
  }

  resetForm() {
    this.essayForm.reset({ question: '', expected_answer: '', points: 1 });
  }

  onSubmit() {
    if (this.essayForm.invalid) {
      this.essayForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const newItem = this.essayForm.getRawValue();
    const examId = this.examId();
    const isEdit = this.isEditMode();
    const itemId = isEdit ? this.itemToEdit()?.id : null;

    const payload = {
      ...newItem,
      level: this.level(),
      type: 'essay',
      topic: this.topic(),
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
      error: (error: any) => {
        console.error('Error saving essay item:', error);
        this.isSaving.set(false);
        this.errorMessage.set(
          error?.error?.message ||
            'Failed to save essay item. Please try again.'
        );
      },
    });
  }
}
