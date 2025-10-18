import { Injectable, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExamApiService } from '../../../../services/exam-api.service';

/**
 * EditExamService manages state and logic for exam editing.
 * Handles form state, validation, and API calls for updating exams.
 */
@Injectable({
  providedIn: 'root',
})
export class EditExamService {
  private api = inject(ExamApiService);
  private fb = inject(FormBuilder);

  // ========== STATE SIGNALS ==========
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  yearOptions = ['1', '2', '3', '4'];
  sectionOptions = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  // ========== FORM SETUP ==========

  /**
   * Create a new exam form group for editing.
   */
  createEditForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      year: [[]],
      sections: [[]],
      starts_at: ['', Validators.required],
      ends_at: ['', Validators.required],
      tos: this.fb.array([this.createTosItem()]),
    });
  }

  /**
   * Create a TOS (Table of Specifications) item.
   */
  createTosItem(): FormGroup {
    return this.fb.group({
      topic: ['', Validators.required],
      time_allotment: [0],
      no_of_items: [{ value: 0, disabled: true }],
      outcomes: [[]],
      distribution: this.fb.group({
        easy: this.fb.group({ allocation: [0] }),
        moderate: this.fb.group({ allocation: [0] }),
        difficult: this.fb.group({ allocation: [0] }),
      }),
    });
  }

  // ========== FORM HELPERS ==========

  /**
   * Get the TOS FormArray from the exam form.
   */
  getTosArray(examForm: FormGroup): FormArray {
    return examForm.get('tos') as FormArray;
  }

  /**
   * Add a new TOS item to the array.
   */
  addTosItem(tosArray: FormArray): void {
    tosArray.push(this.createTosItem());
  }

  /**
   * Remove a TOS item from the array.
   */
  removeTosItem(tosArray: FormArray, index: number): void {
    tosArray.removeAt(index);
  }

  // ========== API CALLS ==========

  /**
   * Load exam data for editing.
   */
  loadExam(examId: number | string) {
    return this.api.show(examId);
  }

  /**
   * Update an exam.
   */
  updateExam(examId: number | string, payload: any) {
    return this.api.update(examId, payload);
  }
}
