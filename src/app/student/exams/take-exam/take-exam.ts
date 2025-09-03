import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {} from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth/services/auth.service';
import { forkJoin, of } from 'rxjs';
import { ExamQuestion } from './exam-question/exam-question';
import { ExamProgress } from './exam-progress/exam-progress';
import { ExamHeader } from './exam-header/exam-header';

export interface ITakenExam {
  id: number; // attempt id
  exam_id: number;
  user_id: number;
  started_at: string;
  submitted_at?: string | null;
  total_points?: number;
  updated_at: string;
  created_at: string;
  answers?: ITakenExamAnswer[];
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

@Component({
  selector: 'app-take-exam',
  standalone: true,
  imports: [ExamHeader, ExamProgress, ExamQuestion],
  templateUrl: './take-exam.html',
  styleUrl: './take-exam.css',
})
export class TakeExam implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  submitting = signal(false);
  error = signal<string | null>(null);
  // No need to track individual answer IDs since backend updateOrCreate handles upsert by (taken_exam_id, exam_item_id)

  answers = signal<Record<string, any>>({});
  private essayDebounceHandles: Record<string, any> = {};

  takenExam = signal<ITakenExam | null>(null);
  private attemptId = computed(() => this.takenExam()?.id || null);
  examItems = signal<IExamItem[]>([]);

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('id');
    if (!examId) {
      this.error.set('Invalid exam id');
      return;
    }

    this.takeExam(+examId);
    this.getExamItems(+examId);
  }

  private takeExam(examId: number) {
    this.http
      .post<{ takenExam: ITakenExam }>(
        `http://127.0.0.1:8000/api/student/exams/${examId}/take`,
        {}
      )
      .subscribe({
        next: ({ takenExam }) => {
          this.takenExam.set(takenExam);
          // Auto-populate answers if present (no PUT needed; already stored)
          if (takenExam.answers?.length) {
            const restored: Record<string, any> = {};
            takenExam.answers.forEach((ans) => {
              const key = ans.exam_item_id;
              let value: any = ans.answer;
              if (ans.type === 'mcq') {
                // ensure numeric index
                const num = Number(value);
                if (!Number.isNaN(num)) value = num;
              } else if (ans.type === 'truefalse') {
                if (value === '1' || value === 1 || value === true)
                  value = true;
                else if (value === '0' || value === 0 || value === false)
                  value = false;
              }
              restored[key] = value;
            });
            this.answers.set(restored);
          }
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Failed to start exam');
        },
      });
  }

  private getExamItems(examId: number) {
    this.http
      .get<IExamItem[]>(
        `http://127.0.0.1:8000/api/student/exams/${examId}/items`
      )
      .subscribe({
        next: (examItems) => {
          this.examItems.set(examItems);
        },
        error: (err) =>
          this.error.set(err?.error?.message || 'Failed to load items'),
      });
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
