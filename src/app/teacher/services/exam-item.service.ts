import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Exam } from './exam.service';

@Injectable({
  providedIn: 'root',
})
export class ExamItemService {
  private http = inject(HttpClient);
  items = signal<ExamItem[]>([]);
  easyItems = computed(() =>
    this.items().filter((item) => item.level === 'easy')
  );
  moderateItems = computed(() =>
    this.items().filter((item) => item.level === 'moderate')
  );
  difficultItems = computed(() =>
    this.items().filter((item) => item.level === 'difficult')
  );

  index(examId: number) {
    return this.http.get<ExamItem[]>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/items`
    );
  }

  store(examId: number, payload: any) {
    return this.http.post<{ item: ExamItem }>(
      `http://127.0.0.1:8000/api/teacher/exams/${examId}/items`,
      payload
    );
  }

  delete(examId: number, itemId: number) {
    return this.http.delete<{ success: boolean }>(
      `http://127.0.0.1:8000/api/teacher/exams/${examId}/items/${itemId}`
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
