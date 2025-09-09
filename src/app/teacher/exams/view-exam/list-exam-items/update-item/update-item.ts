import { Component, input, output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormArray,
} from '@angular/forms';
import { IExamItem, Option } from '../list-exam-items';

@Component({
  selector: 'app-update-item',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-item.html',
  styleUrl: './update-item.css',
})
export class UpdateItem implements OnInit {
  itemInput = input.required<IExamItem>();
  itemSaved = output<IExamItem>();
  close = output<void>();

  fb = inject(FormBuilder);

  // note: `type` is intentionally NOT editable here — keep original item type
  form = this.fb.nonNullable.group({
    question: ['', Validators.required],
    points: [1, [Validators.required, Validators.min(0)]],
    options: this.fb.array([]) as FormArray,
    answer: [null],
    expected_answer: [''],
  });

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

    // clear any existing options
    while (this.options.length) this.options.removeAt(0);

    if (it.type === 'mcq' && it.options?.length) {
      it.options.forEach((o: Option) =>
        this.options.push(this.createOption(o))
      );
    }
  }

  get options() {
    return this.form.get('options') as FormArray;
  }

  createOption(opt?: Option) {
    return this.fb.group({
      text: [opt?.text || '', Validators.required],
      correct: [opt?.correct || false],
    });
  }

  addOption() {
    if (this.options.length < 6) this.options.push(this.createOption());
  }

  removeOption(index: number) {
    if (this.options.length > 2) this.options.removeAt(index);
  }

  setCorrectOption(index: number) {
    const ctrl = this.options.at(index).get('correct');
    if (!ctrl) return;
    ctrl.patchValue(!ctrl.value);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();

    const updated = {
      ...this.itemInput(),
      type: this.itemInput().type,
      question: raw.question,
      points: raw.points,
      expected_answer: raw.expected_answer || null,
      answer: raw.answer ?? null,
      options: raw.options || [],
    } as unknown as IExamItem;

    this.itemSaved.emit(updated);
  }

  onClose() {
    this.close.emit();
  }
}
