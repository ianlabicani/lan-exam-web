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
import { StudentExamItemService } from '../../../services/student-exam-item.service';
import { ExamHeader } from './exam-header/exam-header';
import { ExamProgress } from './exam-progress/exam-progress';
import { ExamQuestion } from './exam-question/exam-question';
import { ExamTimer, type ExamTimerData } from './exam-timer/exam-timer';
import {
  ActivityMonitor,
  type ActivityEvent,
  type ActivitySummary,
} from './activity-monitor/activity-monitor';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment.development';
import { TakenExamService } from '../../../services/taken-exam.service';
import { ExamActivityLogService } from '../../../services/exam-activity-log.service';

@Component({
  selector: 'app-create-taken-exam',
  imports: [
    ExamHeader,
    ExamProgress,
    ExamQuestion,
    ExamTimer,
    ActivityMonitor,
    CommonModule,
  ],
  templateUrl: './create-taken-exam.html',
  styleUrl: './create-taken-exam.css',
})
export class CreateTakenExam implements OnInit, OnDestroy {
  router = inject(Router);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  takenExamSvc = inject(TakenExamService);
  studentExamItemService = inject(StudentExamItemService);
  examActivityService = inject(ExamActivityLogService);

  // Expose Math for template
  Math = Math;

  submitting = signal(false);
  error = signal<string | null>(null);
  answers = signal<Record<string, any>>({});
  takenExam = signal<TakenExam | null>(null);
  examItems = signal<IExamItem[]>([]);
  showEventPanel = signal(false);

  private essayDebounceHandles: Record<string, any> = {};

  // Computed properties for child components
  examTimerData = computed<ExamTimerData | null>(() => {
    const exam = this.takenExam();
    if (!exam?.exam) return null;

    return {
      startedAt: exam.started_at,
      endsAt: exam.exam.ends_at,
      submittedAt: exam.submitted_at,
    };
  });

  activityEvents = computed<ActivityEvent[]>(() => {
    return this.sessionEvents().map((e) => ({
      event_type: e.event_type,
      details: e.details,
      created_at: e.created_at,
    }));
  });

  activitySummary = computed<ActivitySummary>(() => {
    const events = this.sessionEvents();
    const tabSwitches = events.filter(
      (e) => e.event_type === 'tab_hidden' || e.event_type === 'tab_visible'
    ).length;
    const windowSwitches = events.filter(
      (e) => e.event_type === 'window_blur' || e.event_type === 'window_focus'
    ).length;

    return {
      totalEvents: events.length,
      tabSwitches,
      windowSwitches,
      questionsAnswered: events.filter(
        (e) => e.event_type === 'question_answered'
      ).length,
      lastActivity: events[events.length - 1]?.created_at,
    };
  });

  wasSubmitted = computed(() => this.takenExam()?.submitted_at !== null);

  // Activity tracking
  sessionEvents = this.examActivityService.examActivityEvents$;
  eventSummary = computed(() => {
    const events = this.sessionEvents();
    const tabSwitches = events.filter(
      (e) => e.event_type === 'tab_hidden' || e.event_type === 'tab_visible'
    ).length;
    const windowSwitches = events.filter(
      (e) => e.event_type === 'window_blur' || e.event_type === 'window_focus'
    ).length;

    return {
      totalEvents: events.length,
      tabSwitches,
      windowSwitches,
      questionsAnswered: events.filter(
        (e) => e.event_type === 'question_answered'
      ).length,
      lastActivity: events[events.length - 1]?.created_at,
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
      },
      error: (err) => {
        this.error.set(err.message);
      },
    });

    // Fetch user sessions
    this.examActivityService.fetchUserSessions(takenExamId);
  }

  // Handle time expiration from ExamTimer component
  onTimeExpired(): void {
    if (this.submitting() || this.wasSubmitted()) return;

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

  answeredCount() {
    return Object.keys(this.answers()).length;
  }

  submit() {
    const takenExam = this.takenExam();
    if (this.wasSubmitted() || !takenExam || this.submitting()) return;

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

      return this.http.post(
        `${environment.apiBaseUrl}/student/taken-exams/${takenExam.id}/answers`,
        { exam_item_id: id, type: item.type, answer: this.answers()[id] }
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
