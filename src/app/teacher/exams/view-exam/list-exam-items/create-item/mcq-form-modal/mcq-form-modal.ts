import {
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
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
import { ExamItem, ListExamItemsService } from '../../list-exam-items.service';

@Component({
  selector: 'app-mcq-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './mcq-form-modal.html',
  styleUrl: './mcq-form-modal.css',
})
export class McqFormModal implements OnInit {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  listExamItemsSvc = inject(ListExamItemsService);

  level = input.required<'easy' | 'moderate' | 'difficult'>();
  examId = input.required<number>();
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  isModalOpen = input.required<boolean>();
  openModal = output<void>();
  closeModal = output<void>();

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

  ngOnInit(): void {
    this.addOption();
    this.addOption();
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
    this.listExamItemsSvc.store(examId, payload).subscribe({
      next: (_) => {
        this.mcqForm.reset({ question: '', points: 1 });
        while (this.options.length) this.options.removeAt(0);
        this.addOption();
        this.addOption();
        this.mcqForm.markAsPristine();
        this.isSaving.set(false);
        this.closeModal.emit();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to add MCQ');
        this.isSaving.set(false);
      },
    });
  }

  hasAnyCorrect(): boolean {
    return this.options.controls.some((c) => !!c.get('correct')!.value);
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
