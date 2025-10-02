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
import { concatMap, of, forkJoin } from 'rxjs';
import { Exam, ExamService } from '../../../../teacher/services/exam.service';
import { StudentExamItemService } from '../../../services/student-exam-item.service';
import {
  ExamActivityService,
  ExamActivityEvent,
} from '../../../services/exam-activity.service';
import { ExamHeader } from './exam-header/exam-header';
import { ExamProgress } from './exam-progress/exam-progress';
import { ExamQuestion } from './exam-question/exam-question';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment.development';
import { TakenExamService } from '../../../services/taken-exam.service';
import { TakenExam } from '../../../models/exam';

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
  examActivityService = inject(ExamActivityService);

  submitting = signal(false);
  error = signal<string | null>(null);

  answers = signal<Record<string, any>>({});
  private essayDebounceHandles: Record<string, any> = {};

  takenExamSig = signal<TakenExam | null>(null);
  wasSubmitted = computed(() => this.takenExamSig()?.submitted_at !== null);
  private attemptId = computed(() => this.takenExamSig()?.id || null);
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

  getTakenExam() {
    const takenExamId = this.route.snapshot.params['takenExamId'];
    this.takenExamSvc.getOne(takenExamId).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        this.error.set(err.message);
      },
    });
  }

  ngOnInit(): void {
    const takenExamId = this.route.snapshot.params['takenExamId'];

    this.getTakenExam();

    // set the currentSession.
    this.takenExamSvc
      .getOne(takenExamId)
      .pipe(
        concatMap((res) => {
          this.takenExamSig.set(res.takenExam);
          if (res.takenExam.answers?.length) {
            this.setAnswers(res.takenExam.answers);
          }
          return this.studentExamItemService.getExamItems(
            res.takenExam.exam_id
          );
        })
      )
      .subscribe({
        next: (examItems) => {
          this.examItems.set(examItems);
          this.examActivityService.currentSession.set({
            studentId: this.takenExamSig()?.user_id || 0,
            takenExamId: this.takenExamSig()?.id || 0,
            isActive: this.takenExamSig()?.submitted_at === null,
          });

          console.log(this.examActivityService.currentSession());
        },
      });

    // this.examActivityService.fetchUserSessions(takenExamId);
    // // Track page navigation/reload
    // this.examActivityService.logActivity('exam_page_loaded').subscribe();
    // document.addEventListener('visibilitychange', this.onVisibilityChange);
    // window.addEventListener('blur', this.onWindowBlur);
    // window.addEventListener('focus', this.onWindowFocus);
    // // Log initial state
    // this.onVisibilityChange();

    this.takenExamSvc.getOne(takenExamId).subscribe({
      next: (res) => {
        this.takenExamSig.set(res.takenExam);

        if (res.takenExam.answers?.length) {
          this.setAnswers(res.takenExam.answers);
        }
      },
    });
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
    if (this.wasSubmitted()) return;

    if (!this.attemptId() || this.submitting()) return;

    // Log submission attempt with completion stats
    const totalQuestions = this.examItems().length;
    const answeredCount = this.answeredCount();
    this.examActivityService.logActivity(
      'exam_submit_attempted',
      `Attempting to submit exam: ${answeredCount}/${totalQuestions} questions answered (${Math.round(
        (answeredCount / totalQuestions) * 100
      )}% complete)`
    );

    const pendingIds = Object.keys(this.essayDebounceHandles);
    if (!pendingIds.length) {
      this.persistSubmit();
      return;
    }

    const ops = pendingIds.map((id) => {
      const handle = this.essayDebounceHandles[id];
      if (handle) clearTimeout(handle);
      const item = this.examItems().find((i) => String(i.id) === id);
      if (!item) return of(null);
      const value = this.answers()[id];
      return this.http.post(
        `http://127.0.0.1:8000/api/student/taken-exams/${this.attemptId()}/answers`,
        { exam_item_id: id, type: item.type, answer: value }
      );
    });
    this.essayDebounceHandles = {} as any;
    forkJoin(ops).subscribe({
      next: () => this.persistSubmit(),
      error: () => this.persistSubmit(),
    });
  }

  ngOnDestroy(): void {
    // Stop exam activity monitoring when component is destroyed
    this.examActivityService.stopExamSession();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    window.removeEventListener('blur', this.onWindowBlur);
    window.removeEventListener('focus', this.onWindowFocus);
  }

  private persistSubmit() {
    if (!this.attemptId()) return;
    this.submitting.set(true);

    // Log exam submission
    this.examActivityService.logExamSubmitted();

    this.http
      .post(
        `http://127.0.0.1:8000/api/student/taken-exams/${this.attemptId()}/submit`,
        {}
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
          // Stop monitoring after successful submission
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
    const attemptId = this.attemptId();
    if (!attemptId) return;
    // Single POST upsert (backend updateOrCreate)
    this.http
      .post(
        `http://127.0.0.1:8000/api/student/taken-exams/${attemptId}/answers`,
        { exam_item_id: examItem.id, type: examItem.type, answer: value }
      )
      .subscribe({ error: () => {} });
  }

  windowActiveSig = signal<boolean>(true);

  // Handlers as class properties to allow removing listeners
  private onVisibilityChange = () => {
    const isActive = !document.hidden;
    this.windowActiveSig.set(isActive);
    // Optional: broadcast a custom event for other parts of the app
    window.dispatchEvent(
      new CustomEvent(isActive ? 'app:window-active' : 'app:window-inactive')
    );
    // Log result
    console.log(
      `[App] Window ${isActive ? 'active' : 'inactive'} (visibilitychange)`
    );
  };

  private onWindowBlur = () => {
    this.windowActiveSig.set(false);
    window.dispatchEvent(new CustomEvent('app:window-inactive'));
    console.log('[App] Window inactive (blur)');
  };

  private onWindowFocus = () => {
    this.windowActiveSig.set(true);
    window.dispatchEvent(new CustomEvent('app:window-active'));
    console.log('[App] Window active (focus)');
  };
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
