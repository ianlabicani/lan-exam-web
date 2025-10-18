import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  private http = inject(HttpClient);
  viewingExam = signal<Exam | null>(null);
  exams = signal<Exam[]>([]);

  index() {
    return this.http.get<Exam[]>(`${environment.apiBaseUrl}/teacher/exams`);
  }

  show(id: number) {
    return this.http.get<Exam>(`${environment.apiBaseUrl}/teacher/exams/${id}`);
  }

  store(payload: any) {
    return this.http.post<{ data: Exam; message: string }>(
      `${environment.apiBaseUrl}/teacher/exams`,
      payload
    );
  }

  update(id: number, payload: any) {
    return this.http.patch<{ data: Exam; message: string }>(
      `${environment.apiBaseUrl}/teacher/exams/${id}`,
      payload
    );
  }

  updateStatus(id: number | string, status: string) {
    return this.http.patch<{ data: Exam; message: string }>(
      `${environment.apiBaseUrl}/teacher/exams/${id}/status`,
      { status }
    );
  }

  destroy(id: number) {
    return this.http.delete<{ message: string }>(
      `${environment.apiBaseUrl}/teacher/exams/${id}`
    );
  }

  // Exam Items
  createItem(examId: number, itemData: any) {
    return this.http.post<ExamItem>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/items`,
      itemData
    );
  }

  updateItem(examId: number, itemId: number, itemData: any) {
    return this.http.patch<ExamItem>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/items/${itemId}`,
      itemData
    );
  }

  deleteItem(examId: number, itemId: number) {
    return this.http.delete<{ message: string }>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/items/${itemId}`
    );
  }

  reorderItems(examId: number, items: Array<{ id: number; order: number }>) {
    return this.http.patch<ExamItem[]>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/items/reorder`,
      { items }
    );
  }

  // Grading & Submissions
  getTakenExams(examId: number) {
    return this.http.get<TakenExam[]>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/taken-exams`
    );
  }

  getTakenExam(examId: number, takenExamId: number) {
    return this.http.get<TakenExam>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/taken-exams/${takenExamId}`
    );
  }

  gradeSubmission(examId: number, takenExamId: number, gradingData: any) {
    return this.http.post<{ taken_exam: TakenExam }>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/taken-exams/${takenExamId}/grade`,
      gradingData
    );
  }

  // Analytics
  getExamAnalytics(examId: number) {
    return this.http.get<ExamAnalytics>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/analytics`
    );
  }

  // Activity Logs
  getActivityLogs(takenExamId: number) {
    return this.http.get<ActivityLog[]>(
      `${environment.apiBaseUrl}/teacher/taken-exams/${takenExamId}/activity-logs`
    );
  }
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  starts_at: string | Date;
  ends_at: string | Date;
  year: string;
  section?: string;
  sections?: string[];
  status: 'draft' | 'published' | 'active' | 'archived';
  total_points: number;
  items?: ExamItem[];
  tos?: TosTopic[];
  created_at: string | Date;
  updated_at: string | Date;
}

export interface ExamItem {
  id: number;
  exam_id: number;
  type:
    | 'mcq'
    | 'essay'
    | 'true_false'
    | 'short_answer'
    | 'matching'
    | 'fill_blank';
  question: string;
  points: number;
  order: number;
  data: Record<string, any>;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface TakenExam {
  id: number;
  exam_id: number;
  student_id: number;
  student: { id: number; name: string; email: string };
  started_at: string | Date;
  submitted_at?: string | Date;
  score?: number;
  is_graded: boolean;
  answers: StudentAnswer[];
  created_at: string | Date;
  updated_at: string | Date;
}

export interface StudentAnswer {
  id: number;
  item_id: number;
  taken_exam_id: number;
  answer: string | Record<string, any>;
  is_correct?: boolean;
  score?: number;
  feedback?: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface ExamAnalytics {
  exam_id: number;
  total_attempts: number;
  avg_score: number;
  completion_rate: number;
  avg_time_on_exam: number;
  per_question_stats: Array<{
    item_id: number;
    question: string;
    percent_correct: number;
    difficulty_level: 'easy' | 'medium' | 'hard';
  }>;
  score_distribution: Record<string, number>;
}

export interface ActivityLog {
  id: number;
  taken_exam_id: number;
  event_type: 'tab_switch' | 'focus_lost' | 'idle' | 'page_visibility_change';
  timestamp: string | Date;
  metadata: Record<string, any>;
}

export interface TosTopic {
  topic: string;
  outcomes: string[];
  time_allotment: number;
  no_of_items: number;
  distribution: TosDistribution;
}

export interface TosDistribution {
  easy: TosDistributionLevel;
  moderate: TosDistributionLevel;
  difficult: TosDistributionLevel;
}

export interface TosDistributionLevel {
  allocation: number;
  placement: string[];
}
