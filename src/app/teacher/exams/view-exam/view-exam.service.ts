import { inject, Injectable, signal, computed } from '@angular/core';
import { Exam } from '../../services/exam.service';
import { ExamApiService } from '../services/exam-api.service';
import { ExamItemStateService } from './list-exam-items/exam-item-state.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViewExamService {
  exam = signal<Exam | null>(null);
  api = inject(ExamApiService);
  itemsStateSvc = inject(ExamItemStateService);
  /**
   * Internal signal that holds the currently viewing exam for the feature.
   * Use the provided helper methods to update this signal instead of setting directly.
   */
  currentViewingExam = signal<Exam | null>(null);

  /**
   * Read-only computed view that other components can subscribe to.
   * Use `viewingExam()` to read the latest exam or inject it into templates.
   */
  viewingExam = computed(() => this.currentViewingExam());

  show(id: number) {
    return this.api.show(id);
  }

  setCurrentViewingExam(exam: Exam) {
    this.currentViewingExam.set(exam);
  }

  clearCurrentViewingExam() {
    this.currentViewingExam.set(null);
  }

  /**
   * Patch the currently viewing exam with partial updates safely.
   * Returns the updated exam or null if no exam is currently set.
   */
  patchViewingExam(updates: Partial<Exam>): Exam | null {
    const current = this.currentViewingExam();
    if (!current) return null;
    const merged = { ...current, ...updates } as Exam;
    this.currentViewingExam.set(merged);
    return merged;
  }

  /**
   * Replace the currently viewing exam entirely.
   */
  replaceViewingExam(exam: Exam | null) {
    this.currentViewingExam.set(exam);
  }

  /**
   * Utility to return a snapshot (plain object) of the currently viewing exam.
   */
  getViewingExamSnapshot(): Exam | null {
    return this.currentViewingExam();
  }

  /**
   * Update status and return full exam with items.
   */
  updateStatus(id: number | string, status: string) {
    return this.api.updateStatus(id, status).pipe(
      tap((res) => {
        // API returns full exam with items
        this.patchViewingExam(res.data);
      })
    );
  }

  /**
   * Create an item via the items service and update the viewing exam state.
   * The API will return the updated exam with items.
   */
  createItem(examId: number, payload: any) {
    return this.itemsStateSvc.store(examId, payload).pipe(
      tap((res) => {
        // Refetch to get updated exam with all items
        this.show(examId).subscribe({
          next: (res) => {
            this.setCurrentViewingExam(res.data.exam);
          },
        });
      })
    );
  }

  /**
   * Update an item and refetch the exam to update items array and total_points.
   */
  updateItem(examId: number, item: any) {
    return this.itemsStateSvc.update(examId, item).pipe(
      tap(() => {
        // Refetch the exam to get updated items and total_points
        this.show(examId).subscribe({
          next: (res) => {
            this.setCurrentViewingExam(res.data.exam);
          },
        });
      })
    );
  }

  /**
   * Delete an item and refetch the exam to update items array and total_points.
   */
  deleteItem(examId: number, itemId: number) {
    return this.itemsStateSvc.delete(examId, itemId).pipe(
      tap(() => {
        // Refetch the exam to get updated items and total_points
        this.show(examId).subscribe({
          next: (res) => {
            this.setCurrentViewingExam(res.data.exam);
          },
        });
      })
    );
  }
}
