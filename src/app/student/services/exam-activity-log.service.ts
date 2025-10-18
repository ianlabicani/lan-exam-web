import { TakenExamService } from './taken-exam.service';
import { Injectable, Signal, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
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

  // Batch configuration
  private eventBatch: ExamActivityEvent[] = [];
  private batchTimeout: any = null;
  private readonly BATCH_SIZE = 10; // Send after 10 events or timeout
  private readonly BATCH_TIMEOUT_MS = 30000; // Send every 30 seconds

  getAll(takenExamId: number) {
    // Activity endpoint is POST only, so we can't fetch historical logs via GET
    // This method is kept for compatibility but won't work with current API
    return this.http.get<{ examActivityLogs: ExamActivityEvent[] }>(
      `${environment.apiBaseUrl}/student/taken-exams/${takenExamId}/activity`
    );
  }

  store(takenExamId: number, activityEvent: ExamActivityEvent) {
    // Add event to batch instead of sending immediately
    this.eventBatch.push(activityEvent);

    // Reset timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // Send batch if it reaches the size limit
    if (this.eventBatch.length >= this.BATCH_SIZE) {
      return this.sendBatch(takenExamId);
    }

    // Set timeout to send batch if no more events arrive
    this.batchTimeout = setTimeout(() => {
      if (this.eventBatch.length > 0) {
        this.sendBatch(takenExamId).subscribe();
      }
    }, this.BATCH_TIMEOUT_MS);

    return new Observable((observer) => {
      observer.next({ success: true, queued: true });
      observer.complete();
    });
  }

  private sendBatch(takenExamId: number): Observable<any> {
    if (this.eventBatch.length === 0) {
      return new Observable((observer) => {
        observer.next({ success: true, sent: 0 });
        observer.complete();
      });
    }

    const eventsToSend = [...this.eventBatch];
    this.eventBatch = []; // Clear batch

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    // Send all events in the batch
    const requests = eventsToSend.map((event) =>
      this.http.post(
        `${environment.apiBaseUrl}/student/taken-exams/${takenExamId}/activity`,
        {
          event_type: event.event_type,
          details: event.details,
          timestamp: new Date().toISOString(),
        }
      )
    );

    return forkJoin(requests);
  }

  fetchUserSessions(takenExamId: number): void {
    // Note: The current API only supports POST for activity logging,
    // so we can't fetch historical logs. This is kept as a placeholder.
    // Historical logs would be fetched via the show endpoint instead.
  }

  /**
   * Stop monitoring exam activity and clean up listeners
   * Also flushes any remaining batched events
   */
  stopExamSession(takenExamId?: number): void {
    // Flush any remaining events in the batch
    if (takenExamId && this.eventBatch.length > 0) {
      this.sendBatch(takenExamId).subscribe({
        error: (err) => console.error('Failed to flush final batch:', err),
      });
    }

    // Clear timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

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

    return this.store(takenExamId, activityEvent);
  }

  logExamSubmitted(): void {}
  private cleanupEventListeners(): void {
    this.eventListeners.forEach((cleanup) => cleanup());
    this.eventListeners = [];
  }
}
