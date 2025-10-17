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

  updateCurrentViewingExam(updates: Partial<Exam>) {
    const current = this.currentViewingExam();
    if (current) {
      this.currentViewingExam.set({ ...current, ...updates });
    }
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

  updateStatus(id: number | string, status: string) {
    return this.api.updateStatus(id, status);
  }

  /**
   * Create an item via the items service and update the viewing exam state.
   * Returns the observable from ExamItemStateService.store()
   */
  createItem(examId: number, payload: any) {
    return this.itemsStateSvc.store(examId, payload).pipe(
      tap((res) => {
        const addedPoints = res?.data?.points ?? 0;
        if (addedPoints) {
          this.patchViewingExam({
            total_points:
              (this.getViewingExamSnapshot()?.total_points ?? 0) + addedPoints,
          });
        }
      })
    );
  }

  /**
   * Update an item and patch viewing exam total_points by the delta.
   */
  updateItem(examId: number, item: any) {
    // determine previous points from local items
    const prev = this.itemsStateSvc.items$().find((it) => it.id === item.id);
    const prevPoints = prev?.points ?? 0;

    return this.itemsStateSvc.update(examId, item).pipe(
      tap((res) => {
        const newPoints = res?.data?.points ?? item.points ?? 0;
        const delta = newPoints - prevPoints;
        if (delta !== 0) {
          this.patchViewingExam({
            total_points:
              (this.getViewingExamSnapshot()?.total_points ?? 0) + delta,
          });
        }
      })
    );
  }

  /**
   * Delete an item and adjust the viewing exam total_points.
   */
  deleteItem(examId: number, itemId: number) {
    const item = this.itemsStateSvc.items$().find((it) => it.id === itemId);
    const points = item?.points ?? 0;

    return this.itemsStateSvc.delete(examId, itemId).pipe(
      tap(() => {
        if (points) {
          this.patchViewingExam({
            total_points:
              (this.getViewingExamSnapshot()?.total_points ?? 0) - points,
          });
        }
      })
    );
  }
}
