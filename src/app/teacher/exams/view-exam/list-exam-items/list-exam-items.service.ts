import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ListExamItemsService {
  private http = inject(HttpClient);

  private items = signal<ExamItem[]>([]);
  private currentExamId = signal<number | null>(null);

  items$ = computed(() => this.items());
  easyItems$ = computed(() =>
    this.items().filter((item) => item.level === 'easy')
  );
  moderateItems$ = computed(() =>
    this.items().filter((item) => item.level === 'moderate')
  );
  difficultItems$ = computed(() =>
    this.items().filter((item) => item.level === 'difficult')
  );

  setCurrentExamId(examId: number) {
    this.currentExamId.set(examId);
  }

  index(examId: number) {
    this.currentExamId.set(examId);
    return this.http
      .get<{ data: ExamItem[] }>(
        `${environment.apiBaseUrl}/teacher/exams/${examId}/items`
      )
      .pipe(
        tap((res) => {
          this.items.set(res.data);
        })
      );
  }

  store(examId: number, payload: any) {
    this.currentExamId.set(examId);
    return this.http
      .post<{ data: ExamItem }>(
        `${environment.apiBaseUrl}/teacher/exams/${examId}/items`,
        payload
      )
      .pipe(
        tap((res) => {
          this.items.update((prev) => [...prev, res.data]);
        })
      );
  }

  update(examItem: ExamItem) {
    const examId = this.currentExamId();
    if (!examId) {
      throw new Error('No exam ID set. Call index() or store() first.');
    }

    return this.http
      .put<{ data: ExamItem }>(
        `${environment.apiBaseUrl}/teacher/exams/${examId}/items/${examItem.id}`,
        examItem
      )
      .pipe(
        tap((res) => {
          this.items.update((items) =>
            items.map((it) => (it.id === res.data.id ? res.data : it))
          );
        })
      );
  }

  delete(itemId: number) {
    const examId = this.currentExamId();
    if (!examId) {
      throw new Error('No exam ID set. Call index() or store() first.');
    }

    return this.http
      .delete<{ data: boolean }>(
        `${environment.apiBaseUrl}/teacher/exams/${examId}/items/${itemId}`
      )
      .pipe(
        tap(() => {
          this.items.update((prev) =>
            prev.filter((item) => item.id !== itemId)
          );
        })
      );
  }
}

export interface ExamItem {
  id: number;
  exam_id: number;
  type:
    | 'mcq'
    | 'truefalse'
    | 'fillblank'
    | 'shortanswer'
    | 'essay'
    | 'matching';
  level: 'easy' | 'moderate' | 'difficult';
  question: string;
  points: number;
  expected_answer: string | null;
  answer: string | null;
  options: Option[];
  pairs?: MatchingPair[];
  created_at: Date;
  updated_at: Date;
}

export interface Option {
  text: string;
  correct: boolean;
}

export interface MatchingPair {
  left: string;
  right: string;
}
