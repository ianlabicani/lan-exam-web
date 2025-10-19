import { ExamItem, ViewExamService } from '../../../view-exam.service';
import {
  Component,
  OnInit,
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
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment.development';
import { ExamItemApiService } from '../../../../../services/exam-item-api.service';
import { CommonModule } from '@angular/common';
import {
  faQuestionCircle,
  faStar,
  faList,
  faPlus,
  faTrashAlt,
  faExclamationCircle,
  faExclamationTriangle,
  faSave,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-mcq-form-modal',
  imports: [ReactiveFormsModule, CommonModule, FaIconComponent],
  templateUrl: './mcq-form-modal.html',
  styleUrl: './mcq-form-modal.css',
})
export class McqFormModal implements OnInit {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  examItemApi = inject(ExamItemApiService);
  viewExamSvc = inject(ViewExamService);

  // FontAwesome icons
  faQuestionCircle = faQuestionCircle;
  faStar = faStar;
  faList = faList;
  faPlus = faPlus;
  faTrashAlt = faTrashAlt;
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

  readonly String = String;
  readonly MIN_OPTIONS = 2;
  readonly MAX_OPTIONS = 6;

  mcqForm = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3)]],
    points: [1, [Validators.required, Validators.min(1)]],
    options: this.fb.array<FormGroup<any>>([]),
  });

  get options(): FormArray<
    FormGroup<{ text: FormControl<string>; correct: FormControl<boolean> }>
  > {
    return this.mcqForm.get('options') as any;
  }

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

  ngOnInit(): void {
    // Initialize if not in edit mode
    if (!this.isEditMode()) {
      this.resetForm();
    }
  }

  loadItemData(item: ExamItem) {
    this.mcqForm.patchValue({
      question: item.question,
      points: item.points,
    });

    // Clear existing options
    while (this.options.length) this.options.removeAt(0);

    // Load options from item
    if (item.options && Array.isArray(item.options)) {
      item.options.forEach((opt: any) => {
        this.options.push(
          this.createOption(opt.text || '', opt.correct || false)
        );
      });
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.mcqForm.reset({ question: '', points: 1 });
    while (this.options.length) this.options.removeAt(0);
    this.addOption();
    this.addOption();
    this.mcqForm.markAsPristine();
  }

  private createOption(text = '', correct = false) {
    return this.fb.group({
      text: this.fb.nonNullable.control(text, [Validators.required]),
      correct: this.fb.nonNullable.control(correct),
    });
  }

  addOption() {
    if (this.options.length >= this.MAX_OPTIONS) return;
    this.options.push(this.createOption());
  }

  removeOption(i: number) {
    if (this.options.length <= this.MIN_OPTIONS) return;
    this.options.removeAt(i);
  }

  onSubmit() {
    if (this.mcqForm.invalid) {
      this.mcqForm.markAllAsTouched();
      return;
    }
    const val = this.mcqForm.getRawValue() as McqFormValue;
    const opts = val.options.filter((o) => o.text.trim().length > 0);
    if (opts.length < this.MIN_OPTIONS || !opts.some((o) => o.correct)) {
      this.mcqForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const payload = {
      type: 'mcq',
      question: val.question.trim(),
      points: val.points || 1,
      options: opts.map((o) => ({ text: o.text, correct: o.correct })),
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
        this.errorMessage.set(err?.error?.message || 'Failed to save MCQ');
        this.isSaving.set(false);
      },
    });
  }

  hasAnyCorrect(): boolean {
    return this.options.controls.some((c) => !!c.get('correct')!.value);
  }

  asFormGroup(control: any) {
    return control;
  }
}

export interface McqOptionFormValue {
  text: string;
  correct: boolean;
}

export interface McqFormValue {
  question: string;
  points: number;
  options: McqOptionFormValue[];
}
