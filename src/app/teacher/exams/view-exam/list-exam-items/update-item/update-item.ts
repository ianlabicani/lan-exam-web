import {
  Component,
  input,
  output,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormArray,
} from '@angular/forms';
import { ExamItem, ViewExamService, Pair } from '../../view-exam.service';
import { ExamItemApiService } from '../../../../services/exam-item-api.service';

@Component({
  selector: 'app-update-item',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-item.html',
  styleUrl: './update-item.css',
})
export class UpdateItem implements OnInit {
  itemInput = input.required<ExamItem>();
  itemSaved = output<ExamItem>();
  close = output<void>();

  fb = inject(FormBuilder);
  examItemApi = inject(ExamItemApiService);
  viewExamSvc = inject(ViewExamService);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  // note: `type` is intentionally NOT editable here — keep original item type
  form = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3)]],
    points: [1, [Validators.required, Validators.min(1)]],
    options: this.fb.array([]) as FormArray,
    answer: [null],
    expected_answer: [''],
    pairs: this.fb.array([]) as FormArray,
  });

  readonly MAX_OPTIONS = 6;
  readonly MIN_OPTIONS = 2;
  readonly String = String;

  ngOnInit(): void {
    const it = this.itemInput();

    if (!it) return;

    // do not patch or expose `type` — keep the original type intact
    this.form.patchValue({
      question: it.question,
      points: it.points,
      expected_answer: it.expected_answer ?? '',
      answer: (it.answer as any) ?? null,
    } as any);

    // clear any existing arrays
    while (this.options.length) this.options.removeAt(0);
    while (this.pairs.length) this.pairs.removeAt(0);

    // Load type-specific data
    if (it.type === 'mcq' && it.options?.length) {
      it.options.forEach((o) => this.options.push(this.createOption(o)));
    }

    if (it.type === 'matching' && it.pairs?.length) {
      it.pairs.forEach((p) => this.pairs.push(this.createPair(p)));
    }
  }

  get options() {
    return this.form.get('options') as FormArray;
  }

  get pairs() {
    return this.form.get('pairs') as FormArray;
  }

  createOption(opt?: { text: string; correct: boolean }) {
    return this.fb.group({
      text: [opt?.text || '', Validators.required],
      correct: [opt?.correct || false],
    });
  }

  createPair(p?: Pair) {
    return this.fb.group({
      left: [p?.left || '', Validators.required],
      right: [p?.right || '', Validators.required],
    });
  }

  addOption() {
    if (this.options.length < this.MAX_OPTIONS) {
      this.options.push(this.createOption());
    }
  }

  removeOption(index: number) {
    if (this.options.length > this.MIN_OPTIONS) {
      this.options.removeAt(index);
    }
  }

  addPair() {
    this.pairs.push(this.createPair());
  }

  removePair(index: number) {
    if (this.pairs.length > 1) {
      this.pairs.removeAt(index);
    }
  }

  hasAnyCorrect(): boolean {
    return this.options.controls.some((ctrl) => ctrl.get('correct')?.value);
  }

  setCorrectOption(index: number) {
    const ctrl = this.options.at(index).get('correct');
    if (!ctrl) return;
    ctrl.patchValue(!ctrl.value);
  }

  // Template helpers for form group casting
  asFormGroup(control: any) {
    return control;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Validate MCQ has at least one correct answer
    if (this.itemInput().type === 'mcq' && !this.hasAnyCorrect()) {
      this.errorMessage.set('Please select at least one correct answer');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const it = this.itemInput();
    const itemType = it.type;
    const examId = it.exam_id;

    // Build payload based on item type
    const payload: any = {
      type: itemType,
      question: raw.question,
      points: raw.points,
    };

    // Set type-specific fields
    switch (itemType) {
      case 'truefalse':
        payload.answer = String(raw.answer);
        break;
      case 'mcq':
        payload.options = raw.options || [];
        break;
      case 'essay':
        payload.expected_answer = raw.expected_answer || null;
        break;
      case 'fillblank':
        payload.expected_answer = raw.expected_answer || null;
        break;
      case 'shortanswer':
        payload.expected_answer = raw.expected_answer || null;
        break;
      case 'matching':
        payload.pairs = raw.pairs || [];
        break;
    }

    this.examItemApi.updateItem(examId, it.id, payload).subscribe({
      next: (res: { data: ExamItem }) => {
        this.viewExamSvc.updateItem(res.data);
        this.itemSaved.emit(res.data);
        this.isSaving.set(false);
        this.close.emit();
      },
      error: (err: any) => {
        this.errorMessage.set(err?.error?.message || 'Failed to update item');
        this.isSaving.set(false);
      },
    });
  }

  onClose() {
    this.close.emit();
  }
}
