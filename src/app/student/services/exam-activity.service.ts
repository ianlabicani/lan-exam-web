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
export class ExamActivityService {
  private http = inject(HttpClient);

  private examActivityEvents = signal<ExamActivityEvent[]>([]);
  public examActivityEvents$ = this.examActivityEvents as Signal<
    ExamActivityEvent[]
  >;

  private eventListeners: (() => void)[] = [];

  currentSession = signal<ExamSession | null>(null);

  getAll(takenExamId: number) {
    return this.http.get<{ data: ExamActivityEvent[] }>(
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
          this.logActivity(
            'user_sessions_fetch_failed',
            'Failed to retrieve user sessions'
          );
        },
      });
  }

  /**
   * Stop monitoring exam activity and clean up listeners
   */
  stopExamSession(): void {
    this.logActivity('exam_session_ended', 'Student finished or left the exam');
    this.cleanupEventListeners();
  }

  /**
   * Log a specific exam activity event
   */
  logActivity(eventType: string, details?: string): Observable<any> {
    const activityEvent: ExamActivityEvent = {
      taken_exam_id: this.currentSession()?.takenExamId!,
      student_id: this.currentSession()?.studentId!,
      event_type: eventType,
      details,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Add to session events for local tracking
    this.examActivityEvents.update((prev) => [activityEvent, ...prev]);

    return this.store(activityEvent);
  }

  /**
   * Log predefined activity events
   */
  private logTabSwitch(): void {
    this.logActivity(
      'tab_hidden',
      'Student switched tabs or minimized window'
    ).subscribe();
  }

  private logTabReturn(): void {
    this.logActivity(
      'tab_visible',
      'Student returned to the exam tab'
    ).subscribe();
  }

  private logWindowBlur(): void {
    this.logActivity(
      'window_blur',
      'Student switched to another window'
    ).subscribe();
  }

  private logWindowFocus(): void {
    this.logActivity(
      'window_focus',
      'Student returned to exam window'
    ).subscribe();
  }

  logExamSubmitted(): void {
    this.logActivity(
      'exam_submitted',
      'Student submitted the exam'
    ).subscribe();
  }

  /**
   * Setup browser event listeners for activity monitoring
   * Only monitors window and tab activities
   */
  private setupEventListeners(): void {
    // Clean up existing listeners first
    this.cleanupEventListeners();

    // Visibility change (tab switching, minimizing)
    const visibilityHandler = () => {
      if (document.hidden) {
        this.logTabSwitch();
      } else {
        this.logTabReturn();
      }
    };

    // Window focus/blur (switching between applications)
    const blurHandler = () => this.logWindowBlur();
    const focusHandler = () => this.logWindowFocus();

    // Add only window and tab event listeners
    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('blur', blurHandler);
    window.addEventListener('focus', focusHandler);

    // Store cleanup functions
    this.eventListeners = [
      () => document.removeEventListener('visibilitychange', visibilityHandler),
      () => window.removeEventListener('blur', blurHandler),
      () => window.removeEventListener('focus', focusHandler),
    ];
  }

  /**
   * Clean up all event listeners
   */
  private cleanupEventListeners(): void {
    this.eventListeners.forEach((cleanup) => cleanup());
    this.eventListeners = [];
  }
}
