import { TakenExamService } from './taken-exam.service';
import { Injectable, Signal, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface ExamActivityEvent {
  taken_exam_id: number;
  student_id: number;
  event_type: string;
  details?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ExamSession {
  takenExamId: number;
  studentId: number;
  isActive: boolean;
}

@Injectable()
export class ExamActivityLogService {
  private http = inject(HttpClient);

  private examActivityEvents = signal<ExamActivityEvent[]>([]);
  public examActivityEvents$ = this.examActivityEvents.asReadonly();
  private takenExamSvc = inject(TakenExamService);

  private eventListeners: (() => void)[] = [];

  currentSession = signal<ExamSession | null>(null);

  getAll(takenExamId: number) {
    return this.http.get<{ examActivityLogs: ExamActivityEvent[] }>(
      `${environment.apiBaseUrl}/student/taken-exam/${takenExamId}/activity`
    );
  }

  store(activityEvent: ExamActivityEvent) {
    return this.http.post(`${environment.apiBaseUrl}/student/exam-activity`, {
      ...activityEvent,
    });
  }

  fetchUserSessions(takenExamId: number): void {
    this.http
      .get<{ data: ExamActivityEvent[] }>(
        `${environment.apiBaseUrl}/student/taken-exam/${takenExamId}/activity`
      )
      .subscribe({
        next: (response) => {
          this.examActivityEvents.set(response.data);
          console.log(response.data);
        },
        error: (error) => {
          console.error('Failed to fetch user sessions:', error);
        },
      });
  }

  /**
   * Stop monitoring exam activity and clean up listeners
   */
  stopExamSession(): void {
    this.cleanupEventListeners();
  }

  /**
   * Log a specific exam activity event
   */
  logActivity(
    takenExamId: number,
    studentId: number,
    eventType: string,
    details?: string
  ): Observable<any> {
    const activityEvent: ExamActivityEvent = {
      taken_exam_id: takenExamId,
      student_id: studentId,
      event_type: eventType,
      details,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Add to session events for local tracking
    this.examActivityEvents.update((prev) => [activityEvent, ...prev]);

    return this.store(activityEvent);
  }

  logExamSubmitted(): void {}
  private cleanupEventListeners(): void {
    this.eventListeners.forEach((cleanup) => cleanup());
    this.eventListeners = [];
  }
}
