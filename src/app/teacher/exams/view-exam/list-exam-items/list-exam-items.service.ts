import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ListExamItemsService {
  private http = inject(HttpClient);

  private items$ = signal<ExamItem[]>([]);
  items = computed(() => this.items$());
  easyItems = computed(() =>
    this.items$().filter((item) => item.level === 'easy')
  );
  moderateItems = computed(() =>
    this.items$().filter((item) => item.level === 'moderate')
  );
  difficultItems = computed(() =>
    this.items$().filter((item) => item.level === 'difficult')
  );

  index(examId: number) {
    return this.http
      .get<{ data: ExamItem[] }>(
        `${environment.apiBaseUrl}/teacher/exams/${examId}/items`
      )
      .pipe(
        tap((res) => {
          this.items$.set(res.data);
        })
      );
  }

  store(examId: number, payload: any) {
    return this.http
      .post<{ item: ExamItem }>(
        `http://127.0.0.1:8000/api/teacher/exams/${examId}/items`,
        payload
      )
      .pipe(
        tap((res) => {
          this.items$.update((prev) => [...prev, res.item]);
        })
      );
  }

  update(examItem: ExamItem) {
    console.log(examItem);

    return this.http
      .patch<{ data: ExamItem }>(
        `${environment.apiBaseUrl}/teacher/exams/items/${examItem.id}`,
        examItem
      )
      .pipe(
        tap((res) => {
          this.items$.update((items) =>
            items.map((it) => (it.id === res.data.id ? res.data : it))
          );
        })
      );
  }

  delete(itemId: number) {
    return this.http
      .delete<{ success: boolean }>(
        `http://127.0.0.1:8000/api/teacher/exams/items/${itemId}`
      )
      .pipe(
        tap(() => {
          this.items$.update((prev) =>
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
