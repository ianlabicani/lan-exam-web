import { Component, inject, input, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-mcq-item',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './mcq-item.html',
  styleUrls: ['./mcq-item.css'],
})
export class McqItem implements OnInit {
  itemSig = input<any>();
  fb = inject(FormBuilder);

  isEditingSig = signal(false);

  mcqItemForm = this.fb.nonNullable.group({
    question: ['', Validators.required],
    options: this.fb.array([]) as FormArray,
    points: [0, [Validators.required]],
  });

  ngOnInit() {
    const item = this.itemSig();

    if (item) {
      this.mcqItemForm.patchValue({ question: item.question });
      this.mcqItemForm.patchValue({ points: item.points });
      item.options?.forEach((opt: any) => {
        this.mcqItemForm.controls.options.push(
          this.fb.group({
            text: [opt.text],
            correct: [opt.correct],
          })
        );
      });
    }
  }

  toggleEdit() {
    this.isEditingSig.set(!this.isEditingSig());
  }

  addOption() {
    this.mcqItemForm.controls.options.push(
      this.fb.group({
        text: [''],
        correct: [false],
      })
    );
  }

  removeOption(index: number) {
    if (this.mcqItemForm.controls.options.length > 2) {
      this.mcqItemForm.controls.options.removeAt(index);
    }
  }

  submit() {
    if (this.mcqItemForm.invalid) {
      this.mcqItemForm.markAllAsTouched();
      return;
    }
    const value = this.mcqItemForm.getRawValue();
    console.log('Submitting MCQ item:', value);

    this.isEditingSig.set(false);
  }
}
