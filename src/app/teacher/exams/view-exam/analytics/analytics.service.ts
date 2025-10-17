import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment.development';
import { Observable } from 'rxjs';

export interface QuestionStats {
  item_id: number;
  question: string;
  correct: number;
  incorrect: number;
  accuracy: number;
  avgTime?: number;
}

export interface ExamAnalytics {
  total_submissions: number;
  completed_submissions: number;
  graded_submissions: number;
  pending_grading: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  pass_rate: number;
  average_time_minutes: number;
  submission_rate: number;
  question_stats: QuestionStats[];
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor(private http: HttpClient) {}

  /**
   * Get analytics for an exam
   */
  getExamAnalytics(examId: number): Observable<{ data: ExamAnalytics }> {
    return this.http.get<{ data: ExamAnalytics }>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/analytics`
    );
  }
}
