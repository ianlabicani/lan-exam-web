import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  signal,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { of, forkJoin } from 'rxjs';
import { ExamService } from '../../../../teacher/services/exam.service';
import { StudentExamItemService } from '../../../services/student-exam-item.service';
import { ExamHeader } from './exam-header/exam-header';
import { ExamProgress } from './exam-progress/exam-progress';
import { ExamQuestion } from './exam-question/exam-question';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment.development';
import { TakenExamService } from '../../../services/taken-exam.service';
import { ExamActivityLogService } from '../../../services/exam-activity-log.service';

@Component({
  selector: 'app-create-taken-exam',
  imports: [ExamHeader, ExamProgress, ExamQuestion, CommonModule],
  templateUrl: './create-taken-exam.html',
  styleUrl: './create-taken-exam.css',
})
export class CreateTakenExam implements OnInit, OnDestroy {
  router = inject(Router);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  takenExamSvc = inject(TakenExamService);
  studentExamService = inject(ExamService);
  studentExamItemService = inject(StudentExamItemService);
  examActivityService = inject(ExamActivityLogService);

  // Expose Math for template
  Math = Math;

  submitting = signal(false);
  error = signal<string | null>(null);

  answers = signal<Record<string, any>>({});
  private essayDebounceHandles: Record<string, any> = {};
  private countdownInterval?: number;

  takenExam = signal<TakenExam | null>(null);
  currentTime = signal(new Date());

  timeRemaining = computed(() => {
    const takenExam = this.takenExam();
    if (!takenExam || !takenExam.exam) return 0;
    if (takenExam.submitted_at) return 0;

    const now = this.currentTime();
    const endTime = new Date(takenExam.exam.ends_at);
    const diffMs = endTime.getTime() - now.getTime();

    if (diffMs <= 0) return 0;
    return Math.floor(diffMs / 1000); // Return seconds instead of minutes
  });

  timeRemainingDisplay = computed(() => {
    const seconds = this.timeRemaining();
    if (seconds <= 0) return 'Time expired';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  });

  // Progress bar calculations
  timeProgressPercentage = computed(() => {
    const seconds = this.timeRemaining();
    const takenExam = this.takenExam();

    if (!takenExam || !takenExam.exam) return 0;

    // Calculate based on time elapsed vs total exam duration
    const studentStartTime = new Date(takenExam.started_at);
    const endTime = new Date(takenExam.exam.ends_at);

    const totalDurationSeconds = Math.floor(
      (endTime.getTime() - studentStartTime.getTime()) / 1000
    );

    // Prevent division by zero
    if (totalDurationSeconds <= 0) return 100;

    // If time has expired, return 100 (bar is full)
    if (seconds <= 0) return 100;

    // Calculate elapsed time
    const elapsedSeconds = totalDurationSeconds - seconds;

    // Calculate percentage: (time elapsed / total duration) * 100
    const percentage = (elapsedSeconds / totalDurationSeconds) * 100;

    // Ensure percentage is between 0 and 100
    return Math.max(0, Math.min(100, percentage));
  });

  progressBarColor = computed(() => {
    const percentage = this.timeProgressPercentage();
    // Reversed: < 50% is green (early in exam), > 80% is red (almost done)
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-amber-500';
    return 'bg-red-500';
  });

  wasSubmitted = computed(() => this.takenExam()?.submitted_at !== null);
  examItems = signal<IExamItem[]>([]);

  // Activity tracking
  sessionEvents = this.examActivityService.examActivityEvents$;
  showEventPanel = signal(false);
  eventSummary = computed(() => {
    const events = this.sessionEvents();
    return {
      totalEvents: events.length,
      tabSwitches: events.filter(
        (e) => e.event_type === 'tab_hidden' || e.event_type === 'tab_visible'
      ).length,
      windowSwitches: events.filter(
        (e) => e.event_type === 'window_blur' || e.event_type === 'window_focus'
      ).length,
      questionsAnswered: events.filter(
        (e) => e.event_type === 'question_answered'
      ).length,
      lastActivity:
        events.length > 0 ? events[events.length - 1].created_at : undefined,
    };
  });

  ngOnInit(): void {
    const takenExamId = this.route.snapshot.params['takenExamId'];

    // Fetch exam data
    this.takenExamSvc.getOne(takenExamId).subscribe({
      next: (res) => {
        this.takenExam.set(res.takenExam);
        this.examItems.set(res.takenExam.exam?.items || []);

        if (res.takenExam.answers?.length) {
          this.setAnswers(res.takenExam.answers);
        }

        // Log page loaded event
        this.logActivity('exam_page_loaded');

        // Setup activity monitoring after exam is loaded
        this.setupActivityMonitoring();

        // Start countdown timer
        this.startCountdownTimer();
      },
      error: (err) => {
        this.error.set(err.message);
      },
    });

    // Fetch user sessions
    this.examActivityService.fetchUserSessions(takenExamId);
  }

  private startCountdownTimer(): void {
    // Only start if exam is not submitted
    if (this.wasSubmitted()) return;

    // Update current time every second
    this.countdownInterval = window.setInterval(() => {
      this.currentTime.set(new Date());

      // Auto-submit if time expires
      if (this.timeRemaining() <= 0 && !this.wasSubmitted()) {
        this.autoSubmitOnTimeExpired();
      }
    }, 1000);
  }

  private autoSubmitOnTimeExpired(): void {
    if (this.submitting()) return;

    this.logActivity(
      'exam_auto_submitted',
      'Time expired - auto submitting exam'
    );
    this.submit();
  }

  private setupActivityMonitoring(): void {
    // Only set up if exam is not submitted
    if (this.wasSubmitted()) return;

    // Visibility change (tab switching, minimizing)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Window focus/blur (switching between applications)
    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('focus', this.handleWindowFocus);
  }

  private setAnswers(answers: ITakenExamAnswer[]) {
    if (answers?.length) {
      const restored: Record<string, any> = {};
      answers.forEach((ans) => {
        const key = ans.exam_item_id;
        let value: any = ans.answer;
        if (ans.type === 'mcq') {
          const num = Number(value);
          if (!Number.isNaN(num)) value = num;
        } else if (ans.type === 'truefalse') {
          if (
            value === '1' ||
            value === 1 ||
            value === true ||
            value === 'true'
          )
            value = true;
          else if (
            value === '0' ||
            value === 0 ||
            value === false ||
            value === 'false'
          )
            value = false;
        } else if (
          ans.type === 'shortanswer' ||
          ans.type === 'fill_blank' ||
          ans.type === 'essay'
        ) {
          // ensure string
          value = value ?? '';
          if (typeof value !== 'string') value = String(value);
        } else if (ans.type === 'matching') {
          // Expect array of selected right indices; parse JSON if string
          try {
            if (typeof value === 'string') value = JSON.parse(value);
          } catch (_) {
            // fallback: empty array
            value = [];
          }
          if (Array.isArray(value)) {
            value = value.map((v) => {
              const n = typeof v === 'number' ? v : parseInt(String(v), 10);
              return Number.isNaN(n) ? null : n;
            });
          }
        }
        restored[key] = value;
      });
      this.answers.set(restored);
    }
  }

  onAnswerChange(item: IExamItem, value: any) {
    this.answers.set({ ...this.answers(), [item.id]: value });
    this.upsertAnswer(item, value);
  }

  toggleEventPanel() {
    this.showEventPanel.update((show) => !show);
  }

  getEventTypeDisplay(eventType: string): string {
    const eventTypeMap: Record<string, string> = {
      exam_session_started: '🎯 Exam Started',
      exam_session_ended: '✅ Exam Ended',
      exam_submitted: '📤 Exam Submitted',
      exam_auto_submitted: '⏰ Auto-Submitted (Time Expired)',
      tab_hidden: '👁️ Tab Hidden',
      tab_visible: '👁️ Tab Visible',
      window_blur: '🔄 Window Lost Focus',
      window_focus: '🔄 Window Gained Focus',
      exam_page_loaded: '📄 Exam Page Loaded',
      previous_answers_loaded: '📄 Previous Answers Loaded',
    };
    return eventTypeMap[eventType] || `📝 ${eventType}`;
  }

  getEventSeverity(eventType: string): 'normal' | 'warning' | 'danger' {
    if (eventType.includes('tab_hidden') || eventType.includes('window_blur')) {
      return 'warning';
    }
    return 'normal';
  }

  getActivityTrend(): 'active' | 'moderate' {
    const events = this.sessionEvents();
    const recentEvents = events.filter((e) => {
      const eventTime = new Date(e.created_at!);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return eventTime > fiveMinutesAgo;
    });

    const warningCount = recentEvents.filter(
      (e) => this.getEventSeverity(e.event_type) === 'warning'
    ).length;

    if (warningCount > 3) return 'moderate';
    return 'active';
  }

  getSessionDuration(): string {
    const events = this.sessionEvents();
    const startEvent = events.find(
      (e) => e.event_type === 'exam_session_started'
    );

    if (!startEvent?.created_at) return '0 minutes';

    const startTime = new Date(startEvent.created_at);
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  }

  answeredCount() {
    return Object.keys(this.answers()).length;
  }

  submit() {
    if (this.wasSubmitted() || !this.takenExam() || this.submitting()) return;

    const takenExam = this.takenExam()!;
    const totalQuestions = this.examItems().length;
    const answeredCount = this.answeredCount();

    // Log submission attempt
    this.logActivity(
      'exam_submit_attempted',
      `${answeredCount}/${totalQuestions} questions answered (${Math.round(
        (answeredCount / totalQuestions) * 100
      )}% complete)`
    );

    const pendingIds = Object.keys(this.essayDebounceHandles);
    if (!pendingIds.length) {
      this.persistSubmit();
      return;
    }

    // Save pending essay answers before submission
    const ops = pendingIds.map((id) => {
      const handle = this.essayDebounceHandles[id];
      if (handle) clearTimeout(handle);
      const item = this.examItems().find((i) => String(i.id) === id);
      if (!item) return of(null);
      const value = this.answers()[id];
      return this.http.post(
        `${environment.apiBaseUrl}/student/taken-exams/${takenExam.id}/answers`,
        { exam_item_id: id, type: item.type, answer: value }
      );
    });

    this.essayDebounceHandles = {};
    forkJoin(ops).subscribe({
      next: () => this.persistSubmit(),
      error: () => this.persistSubmit(),
    });
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);

    // Clear countdown interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    // Stop exam session
    this.examActivityService.stopExamSession();
  }

  // Simplified visibility and focus handlers
  private handleVisibilityChange = (): void => {
    if (this.wasSubmitted()) return;

    const eventType = document.hidden ? 'tab_hidden' : 'tab_visible';
    this.logActivity(eventType);
  };

  private handleWindowBlur = (): void => {
    if (this.wasSubmitted()) return;
    this.logActivity('window_blur');
  };

  private handleWindowFocus = (): void => {
    if (this.wasSubmitted()) return;
    this.logActivity('window_focus');
  };

  // Centralized activity logging
  private logActivity(eventType: string, details?: string): void {
    const takenExam = this.takenExam();
    if (!takenExam) return;

    this.examActivityService
      .logActivity(takenExam.id, takenExam.user_id, eventType, details)
      .subscribe();
  }

  private persistSubmit() {
    const takenExam = this.takenExam();
    if (!takenExam) return;

    this.submitting.set(true);

    // Log exam submission
    this.logActivity('exam_submitted');

    this.http
      .post(
        `${environment.apiBaseUrl}/student/taken-exams/${takenExam.id}/submit`,
        {}
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.examActivityService.stopExamSession();
          this.router.navigate(['/student/exams']);
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Submit failed');
          this.submitting.set(false);
        },
      });
  }

  private upsertAnswer(examItem: IExamItem, value: any) {
    const takenExam = this.takenExam();
    if (!takenExam) return;

    this.http
      .post(
        `${environment.apiBaseUrl}/student/taken-exams/${takenExam.id}/answers`,
        {
          exam_item_id: examItem.id,
          type: examItem.type,
          answer: value,
        }
      )
      .subscribe({ error: () => {} });
  }
}

export interface ITakenExam {
  id: number;
  exam_id: number;
  user_id: number;
  started_at: string;
  submitted_at?: string | null;
  total_points?: number;
  updated_at: string;
  created_at: string;
  answers?: ITakenExamAnswer[];
  exam?: Exam;
}

export interface IExamItem {
  id: number;
  exam_id: number;
  type: string;
  question: string;
  points: number;
  expected_answer: string | null;
  answer: any;
  options: any[] | null;
  pairs?: { left: string; right: string }[] | null; // for matching
  created_at: string;
  updated_at: string;
}

export interface ITakenExamAnswer {
  id: number;
  taken_exam_id: number;
  exam_item_id: number; // backend field
  type: string;
  answer: any; // stored as string for mcq index coming from backend
  points_awarded?: number | null;
  created_at: string;
  updated_at: string;
}

export interface TakenExam {
  id: number;
  exam_id: number;
  type: string;
  user_id: number;
  started_at: Date;
  submitted_at: null;
  total_points: number;
  created_at: Date;
  updated_at: Date;
  exam: Exam;
  answers: Answer[];
}

export interface Answer {
  id: number;
  taken_exam_id: number;
  exam_item_id: number;
  type: string;
  answer: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  starts_at: Date;
  ends_at: Date;
  year: string;
  sections: string[];
  status: string;
  total_points: number;
  tos: To[];
  created_at: Date;
  updated_at: Date;
  items: Item[];
}

export interface Item {
  id: number;
  exam_id: number;
  type: string;
  question: string;
  points: number;
  expected_answer: null | string;
  answer: null | string;
  options: Option[] | null;
  pairs: null;
  created_at: Date;
  updated_at: Date;
  level: string;
}

export interface Option {
  text: string;
  correct: boolean;
}

export interface To {
  topic: string;
  outcomes: any[];
  time_allotment: number;
  no_of_items: number;
  distribution: Distribution;
}

export interface Distribution {
  easy: Difficult;
  moderate: Difficult;
  difficult: Difficult;
}

export interface Difficult {
  allocation: number;
  placement: any[];
}
