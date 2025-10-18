import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

export interface TakenExamForGrading {
  id: number;
  exam_id: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    email: string;
    year: string;
    section: string;
  };
  exam: {
    id: number;
    title: string;
    total_points: number;
    status: string;
  };
  submitted_at: string;
  status: string;
  total_points: number;
  answers: any[];
}

export interface GradingDetail {
  takenExam: TakenExamForGrading;
  exam: any;
  student: any;
  itemsNeedingGrading: any[];
  totalItems: number;
  autoGradedItems: number;
  manualGradedItems: number;
  pendingGradingItems: number;
  autoGradedScore: number;
  manualGradedScore: number;
  gradedItems: Record<number, boolean>;
  activityLogs: any[];
}

export interface UpdateScorePayload {
  teacher_score: number;
  feedback?: string;
}

export interface UpdateScoreResponse {
  success: boolean;
  message: string;
  updated_item: {
    id: number;
    exam_item_id: number;
    points_earned: number;
    feedback: string | null;
  };
  total_score: number;
}

export interface FinalizeGradeResponse {
  success: boolean;
  status: string;
  final_score: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class GradingService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl;

  /**
   * Get list of pending submissions for the teacher
   */
  getPendingSubmissions(): Observable<{ data: TakenExamForGrading[] }> {
    return this.http.get<{ data: TakenExamForGrading[] }>(
      `${this.apiUrl}/teacher/grading`
    );
  }

  /**
   * Get grading details for a specific submission
   */
  getGradingDetail(takenExamId: number): Observable<GradingDetail> {
    return this.http.get<GradingDetail>(
      `${this.apiUrl}/teacher/grading/${takenExamId}`
    );
  }

  /**
   * Update score for a specific answer item
   */
  updateScore(
    takenExamId: number,
    itemId: number,
    payload: UpdateScorePayload
  ): Observable<UpdateScoreResponse> {
    return this.http.patch<UpdateScoreResponse>(
      `${this.apiUrl}/teacher/grading/${takenExamId}/items/${itemId}`,
      payload
    );
  }

  /**
   * Finalize grading for a submission
   */
  finalizeGrade(takenExamId: number): Observable<FinalizeGradeResponse> {
    return this.http.post<FinalizeGradeResponse>(
      `${this.apiUrl}/teacher/grading/${takenExamId}/finalize`,
      {}
    );
  }
}
