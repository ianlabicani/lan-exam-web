import { Component, inject, input, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ViewExamItemsService } from '../../view-exam-items.service';
import { ExamService } from '../../../exam.service';

@Component({
  selector: 'app-essay-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './essay-form.html',
  styleUrl: './essay-form.css',
})
export class EssayForm {
  itemCreated = output<any>();
  protected viewExamItemsService = inject(ViewExamItemsService);
  protected examService = inject(ExamService);
  private fb = inject(FormBuilder);

  examIdSig = input<number | null>();
  isSavingSig = signal(false);

  essayForm = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3)]],
    expected_answer: ['', [Validators.required]],
    points: [1, [Validators.required, Validators.min(1)]],
    type: 'essay',
  });

  createEssayItem() {
    this.isSavingSig.set(true);
    if (this.essayForm.invalid) {
      this.essayForm.markAllAsTouched();
      return;
    }

    const newItem = this.essayForm.getRawValue();
    console.log(newItem);

    this.examService
      .createItem(this.examIdSig() ?? 0, {
        ...newItem,
        type: 'essay',
      })
      .subscribe({
        next: (res) => {
          this.essayForm.reset();
          this.viewExamItemsService.addItem(res.item);
          this.itemCreated.emit(res.item);
          this.isSavingSig.set(false);
        },
        error: (error) => {
          console.error('Error creating essay item:', error);
          this.isSavingSig.set(false);
        },
      });
  }
}
