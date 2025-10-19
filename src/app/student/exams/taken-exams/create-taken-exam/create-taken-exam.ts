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
import {
  ActivityMonitor,
  type ActivityEvent,
  type ActivitySummary,
} from './activity-monitor/activity-monitor';
import { SubmitModal } from './submit-modal/submit-modal';
import { ErrorModal } from '../../../../shared/components/error-modal/error-modal';
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
    ActivityMonitor,
    SubmitModal,
    ErrorModal,
    CommonModule,
  ],
  templateUrl: './create-taken-exam.html',
  styleUrl: './create-taken-exam.css',
  standalone: true,
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
  showSubmitModal = signal(false);
  isSaving = signal(false);

  private essayDebounceHandles: Record<string, any> = {};
  private savingTimeouts: Record<string, any> = {};

  // Computed properties for child components
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

  // Computed - answered count
  answeredCount = computed(() => {
    const answers = this.answers();
    return Object.keys(answers).filter(
      (key) =>
        answers[key] !== undefined &&
        answers[key] !== null &&
        answers[key] !== ''
    ).length;
  });

  // Activity tracking
  sessionEvents = this.examActivityService.examActivityEvents$;

  // ===== Answer & Saving =====
  onAnswerChange(item: IExamItem, value: any): void {
    this.answers.set({ ...this.answers(), [item.id]: value });
    this.saveAnswerWithDebounce(item, value);
  }

  private saveAnswerWithDebounce(item: IExamItem, value: any): void {
    // Clear existing timeout for this item
    if (this.savingTimeouts[item.id]) {
      clearTimeout(this.savingTimeouts[item.id]);
    }

    this.isSaving.set(true);

    // Debounce save for 1 second
    this.savingTimeouts[item.id] = setTimeout(() => {
      this.upsertAnswer(item, value);
    }, 1000);
  }

  // ===== Modal Methods =====
  openSubmitModal(): void {
    this.showSubmitModal.set(true);
  }

  closeSubmitModal(): void {
    this.showSubmitModal.set(false);
  }

  closeErrorModal(): void {
    this.error.set(null);
  }

  submitExam(): void {
    this.submit();
  }

  // ===== Question Type Helper =====
  getTypeLabel(type: string | undefined): string {
    const labels: Record<string, string> = {
      mcq: 'Multiple Choice',
      truefalse: 'True/False',
      essay: 'Essay',
      fill_blank: 'Fill in the Blank',
      fillblank: 'Fill in the Blank',
      shortanswer: 'Short Answer',
      matching: 'Matching',
    };
    return labels[type || ''] || type || 'Unknown';
  }

  // ===== Page Unload Handler =====
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.wasSubmitted() && this.answeredCount() > 0) {
      event.preventDefault();
      event.returnValue =
        'You have unsaved answers. Are you sure you want to leave?';
    }
  }

  ngOnInit(): void {
    const takenExamId = this.route.snapshot.params['takenExamId'];

    // Fetch exam data
    this.takenExamSvc.getOne(takenExamId).subscribe({
      next: (res) => {
        // Handle both response formats from the API
        const takenExamData = res.taken_exam || res.takenExam;
        let examData = res.exam;

        // If exam data is not at top level, try to get it from takenExamData
        if (!examData && takenExamData?.exam) {
          examData = takenExamData.exam;
        }

        if (takenExamData) {
          // Ensure exam is merged into taken_exam
          if (examData) {
            takenExamData.exam = examData;
          }

          this.takenExam.set(takenExamData);

          // Set exam items from either structure
          const items = examData?.items || takenExamData.exam?.items || [];
          this.examItems.set(items);

          // Restore answers if they exist
          if (takenExamData.answers?.length) {
            this.setAnswers(takenExamData.answers);
          }

          // Log page loaded event
          this.logActivity('exam_page_loaded');

          // Setup activity monitoring after exam is loaded
          this.setupActivityMonitoring();
        } else {
          this.error.set(
            'Failed to load exam data - missing taken exam information'
          );
        }
      },
      error: (err) => {
        this.error.set(
          err.error?.error || err.message || 'Failed to load exam'
        );
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
      const itemsMap = new Map(this.examItems().map((item) => [item.id, item]));

      answers.forEach((ans) => {
        const key = ans.exam_item_id;
        let value: any = ans.answer;

        // Get the actual question type from examItems
        const questionItem = itemsMap.get(key);
        const questionType = questionItem?.type || ans.type;

        if (questionType === 'mcq') {
          const num = Number(value);
          if (!Number.isNaN(num)) value = num;
        } else if (questionType === 'truefalse') {
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
          questionType === 'shortanswer' ||
          questionType === 'fill_blank' ||
          questionType === 'fillblank' ||
          questionType === 'essay'
        ) {
          // ensure string
          value = value ?? '';
          if (typeof value !== 'string') value = String(value);
        } else if (questionType === 'matching') {
          // Parse JSON if string; answers are now objects: [{"left":"...", "right":"..."}]
          try {
            if (typeof value === 'string') value = JSON.parse(value);
          } catch (_) {
            // fallback: empty array
            value = [];
          }
          // Keep as array of objects - no conversion needed
          if (!Array.isArray(value)) {
            value = [];
          }
        }
        restored[key] = value;
      });
      this.answers.set(restored);
    }
  }

  toggleEventPanel() {
    this.showEventPanel.update((show) => !show);
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
        `${environment.apiBaseUrl}/student/taken-exams/${takenExam.id}/save-answer`,
        { item_id: id, answer: this.answers()[id] }
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

    // Stop exam session and flush remaining events
    const takenExam = this.takenExam();
    this.examActivityService.stopExamSession(takenExam?.id);
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
          const takenExam = this.takenExam();
          this.examActivityService.stopExamSession(takenExam?.id);
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
        `${environment.apiBaseUrl}/student/taken-exams/${takenExam.id}/save-answer`,
        {
          item_id: examItem.id,
          answer: value,
        }
      )
      .subscribe({
        next: () => {
          this.isSaving.set(false);
        },
        error: () => {
          this.isSaving.set(false);
        },
      });
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
