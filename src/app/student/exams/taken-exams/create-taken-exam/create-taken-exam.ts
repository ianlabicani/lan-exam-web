import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { concatMap, of, forkJoin } from 'rxjs';
import { Exam } from '../../../../teacher/services/exam.service';
import { StudentExamItemService } from '../../../services/student-exam-item.service';
import { StudentExamService } from '../../../services/student-exam.service';
import { StudentTakenExamService } from '../../../services/student-taken-exam.service';
import { ExamHeader } from './exam-header/exam-header';
import { ExamProgress } from './exam-progress/exam-progress';
import { ExamQuestion } from './exam-question/exam-question';

@Component({
  selector: 'app-create-taken-exam',
  imports: [ExamHeader, ExamProgress, ExamQuestion],
  templateUrl: './create-taken-exam.html',
  styleUrl: './create-taken-exam.css',
})
export class CreateTakenExam {
  router = inject(Router);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  studentTakenExamService = inject(StudentTakenExamService);
  studentExamService = inject(StudentExamService);
  studentExamItemService = inject(StudentExamItemService);

  submitting = signal(false);
  error = signal<string | null>(null);

  answers = signal<Record<string, any>>({});
  private essayDebounceHandles: Record<string, any> = {};

  takenExamSig = signal<ITakenExam | null>(null);
  wasSubmitted = computed(() => this.takenExamSig()?.submitted_at !== null);
  private attemptId = computed(() => this.takenExamSig()?.id || null);
  examItems = signal<IExamItem[]>([]);

  ngOnInit(): void {
    const takenExamId = this.route.snapshot.params['takenExamId'];

    this.studentTakenExamService.getOne(takenExamId).subscribe({
      next: (res) => {
        this.takenExamSig.set(res.data);

        if (res.data.answers?.length) {
          this.setAnswers(res.data.answers);
        }
      },
    });

    this.studentTakenExamService
      .getOne(takenExamId)
      .pipe(
        concatMap((res) => {
          this.takenExamSig.set(res.data);
          if (res.data.answers?.length) {
            this.setAnswers(res.data.answers);
          }
          return this.studentExamItemService.getExamItems(res.data.exam_id);
        })
      )
      .subscribe({
        next: (examItems) => {
          this.examItems.set(examItems);
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

  answeredCount() {
    return Object.keys(this.answers()).length;
  }

  answeredPercent() {
    const total = this.examItems().length;
    if (!total) return 0;
    return (this.answeredCount() / total) * 100;
  }

  submit() {
    if (this.wasSubmitted()) return;

    if (!this.attemptId() || this.submitting()) return;
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

  private persistSubmit() {
    if (!this.attemptId()) return;
    this.submitting.set(true);
    this.http
      .post(
        `http://127.0.0.1:8000/api/student/taken-exams/${this.attemptId()}/submit`,
        {}
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
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
