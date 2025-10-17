import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment.development';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class ExamItemApiService {
  private http = inject(HttpClient);

  /**
   * Fetch all items for a given exam
   */
  index(examId: number): Observable<{ data: ExamItem[] }> {
    return this.http.get<{ data: ExamItem[] }>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/items`
    );
  }

  /**
   * Create a new item for a given exam
   */
  store(examId: number, payload: any): Observable<{ data: ExamItem }> {
    return this.http.post<{ data: ExamItem }>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/items`,
      payload
    );
  }

  /**
   * Update an existing item
   */
  update(
    examId: number,
    itemId: number,
    payload: any
  ): Observable<{ data: ExamItem }> {
    return this.http.put<{ data: ExamItem }>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/items/${itemId}`,
      payload
    );
  }

  /**
   * Delete an item
   */
  delete(examId: number, itemId: number): Observable<{ data: boolean }> {
    return this.http.delete<{ data: boolean }>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/items/${itemId}`
    );
  }
}
