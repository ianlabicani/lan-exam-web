import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Component, signal, inject, input, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ExamService } from '../../../exam.service';
// import { ViewExamItemsService } from '../../view-exam-items.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgClass } from '@angular/common';

export interface McqOptionFormValue {
  text: string;
  correct: boolean;
}

export interface McqFormValue {
  question: string;
  points: number;
  options: McqOptionFormValue[];
}

@Component({
  selector: 'app-mcq-form',
  imports: [ReactiveFormsModule, FormsModule, FaIconComponent, NgClass],
  templateUrl: './mcq-form.html',
  styleUrl: './mcq-form.css',
})
export class McqForm implements OnInit {
  fb = inject(FormBuilder);
  private examService = inject(ExamService);
  // protected viewExamItemsService = inject(ViewExamItemsService);

  // icons
  faPlus = faPlus;
  faTrash = faTrash;

  examIdSig = input.required<number>();

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

  readonly MIN_OPTIONS = 2;
  readonly MAX_OPTIONS = 6;

  // expose validity & dirty signals for template convenience
  isDirty = signal(false);
  saving = signal(false);
  errorMsg = signal<string | null>(null);

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

  toggleCorrect(i: number, event: any) {
    // keep multiple correct allowed; nothing special needed beyond change detection
    const ctrl = this.options.at(i).get('correct') as FormControl<boolean>;
    ctrl.setValue(event.target.checked);
  }

  createItem() {
    if (this.mcqForm.invalid) {
      this.mcqForm.markAllAsTouched();
      return;
    }

    const examId = this.examIdSig();
    const mcqFormRawVal = this.mcqForm.getRawValue() as McqFormValue;
    const opts = mcqFormRawVal.options.filter((o) => o.text.trim().length > 0);

    if (opts.length < this.MIN_OPTIONS || !opts.some((o) => o.correct)) return;

    this.saving.set(true);
    this.errorMsg.set(null);

    this.examService
      .createItem(examId, {
        type: 'mcq',
        question: mcqFormRawVal.question.trim(),
        points: mcqFormRawVal.points || 1,
        options: opts.map((o) => ({ text: o.text, correct: o.correct })),
      })
      .subscribe({
        next: (res) => {
          // this.viewExamItemsService.addItem(res.item);
          // reset form

          this.mcqForm.reset({ question: '', points: 1 });
          while (this.options.length) this.options.removeAt(0);
          this.addOption();
          this.addOption();
          this.mcqForm.markAsPristine();
          this.saving.set(false);
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Failed to add MCQ');
          this.saving.set(false);
        },
      });
  }

  getErrorMessages(): string[] {
    const msgs: string[] = [];
    if (!this.mcqForm.get('question')!.valid)
      msgs.push('Question is required (min 3 chars).');
    if (!this.mcqForm.get('points')!.valid)
      msgs.push('Points must be at least 1.');
    const opts = this.options.controls
      .map((c) => c.get('text')!.value.trim())
      .filter((v) => v.length > 0);
    if (opts.length < this.MIN_OPTIONS)
      msgs.push(`At least ${this.MIN_OPTIONS} options.`);
    if (!this.options.controls.some((c) => c.get('correct')!.value))
      msgs.push('Mark at least one correct option.');
    return msgs;
  }
}
