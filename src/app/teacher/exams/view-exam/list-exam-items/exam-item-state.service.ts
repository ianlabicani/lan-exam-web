import { computed, inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import {
  ExamItemApiService,
  ExamItem,
  Option,
  MatchingPair,
} from './exam-item-api.service';

@Injectable({
  providedIn: 'root',
})
export class ExamItemStateService {
  private apiService = inject(ExamItemApiService);

  private items = signal<ExamItem[]>([]);
  private currentExamId = signal<number | null>(null);

  /**
   * Computed accessor for all items
   */
  items$ = computed(() => this.items());

  /**
   * Computed accessor for easy difficulty items
   */
  easyItems$ = computed(() =>
    this.items().filter((item) => item.level === 'easy')
  );

  /**
   * Computed accessor for moderate difficulty items
   */
  moderateItems$ = computed(() =>
    this.items().filter((item) => item.level === 'moderate')
  );

  /**
   * Computed accessor for difficult items
   */
  difficultItems$ = computed(() =>
    this.items().filter((item) => item.level === 'difficult')
  );

  /**
   * Fetch items for an exam
   */
  index(examId: number) {
    this.currentExamId.set(examId);
    return this.apiService.index(examId).pipe(
      tap((res) => {
        this.items.set(res.data);
      })
    );
  }

  /**
   * Create a new item
   */
  store(examId: number, payload: any) {
    this.currentExamId.set(examId);
    return this.apiService.store(examId, payload).pipe(
      tap((res) => {
        this.items.update((prev) => [...prev, res.data]);
      })
    );
  }

  /**
   * Update an existing item
   */
  update(examId: number, examItem: ExamItem) {
    return this.apiService.update(examId, examItem.id, examItem).pipe(
      tap((res) => {
        this.items.update((items) =>
          items.map((it) => (it.id === res.data.id ? res.data : it))
        );
      })
    );
  }

  /**
   * Delete an item
   */
  delete(examId: number, itemId: number) {
    return this.apiService.delete(examId, itemId).pipe(
      tap(() => {
        this.items.update((prev) => prev.filter((item) => item.id !== itemId));
      })
    );
  }
}

export type { ExamItem, Option, MatchingPair };
