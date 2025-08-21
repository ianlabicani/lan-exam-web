import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';

interface ExamItem {
  id: string;
  examId: string;
  type: 'mcq' | 'truefalse' | 'essay';
  question: string;
  points: number;
  options?: { text: string; correct: boolean }[];
  answer?: boolean;
  expectedAnswer?: string;
}

interface ExamMeta {
  id: string;
  title: string;
  description?: string;
  startsAt?: string | Date;
  endsAt?: string | Date;
  duration?: number;
  status: 'draft' | 'published' | 'archived' | 'active';
  section: string;
  year: string;
  totalPoints?: number;
}

interface TakenExamRecord {
  id: string; // attempt id
  examId: string;
  userId: string;
  startedAt: string;
  submittedAt: string | null; // null while in progress
  score?: number; // computed if auto grading implemented later
  totalPoints?: number;
}

interface TakenExamAnswer {
  attemptId: string; // links to TakenExamRecord.id
  itemId: string;
  type: ExamItem['type'];
  answer: any; // mcq: index / truefalse: boolean / essay: text
  pointsAwarded?: number;
}

@Component({
  selector: 'app-take-exam',
  imports: [RouterLink, DatePipe, NgClass],
  templateUrl: './take-exam.html',
  styleUrl: './take-exam.css',
})
export class TakeExam implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  exam = signal<ExamMeta | null>(null);
  items = signal<ExamItem[]>([]);
  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  private startedAtIso: string | null = null;
  private attemptId: string | null = null;

  // answer state keyed by item id
  answers = signal<Record<string, any>>({});
  private essayDebounceHandles: Record<string, any> = {};

  totalPoints = computed(() =>
    this.items().reduce((s, i) => s + (i.points || 0), 0)
  );

  timeRemaining = signal<number | null>(null); // seconds
  private countdownHandle: any;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Invalid exam id');
      this.loading.set(false);
      return;
    }
    this.loadExam(id);
  }

  private loadExam(id: string) {
    const exams: ExamMeta[] = JSON.parse(localStorage.getItem('exams') || '[]');
    const exam = exams.find((e) => e.id === id) || null;
    if (!exam) {
      this.error.set('Exam not found');
      this.loading.set(false);
      return;
    }
    if (exam.status !== 'active') {
      this.error.set('Exam is not currently active.');
    }
    this.exam.set(exam);
    const allItems: ExamItem[] = JSON.parse(
      localStorage.getItem('examItems') || '[]'
    );
    const items = allItems.filter((i) => i.examId === id);
    this.items.set(items);
    // ensure draft record (in-progress) and restore answers if any
    this.ensureDraftRecord();
    this.initializeTimer(exam);
    this.loading.set(false);
  }

  private initializeTimer(exam: ExamMeta) {
    if (exam.duration) {
      // duration minutes from start now
      const seconds = exam.duration * 60;
      this.timeRemaining.set(seconds);
      this.countdownHandle = setInterval(() => {
        const left = (this.timeRemaining() || 0) - 1;
        this.timeRemaining.set(left);
        if (left <= 0) {
          clearInterval(this.countdownHandle);
          this.autoSubmit();
        }
      }, 1000);
    } else if (exam.endsAt) {
      const end = new Date(exam.endsAt).getTime();
      this.countdownHandle = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((end - now) / 1000));
        this.timeRemaining.set(diff);
        if (diff <= 0) {
          clearInterval(this.countdownHandle);
          this.autoSubmit();
        }
      }, 1000);
    }
  }

  displayTime(): string | null {
    const secs = this.timeRemaining();
    if (secs == null) return null;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  setMcqAnswer(item: ExamItem, optionIndex: number) {
    this.answers.set({ ...this.answers(), [item.id]: optionIndex });
    this.saveProgress();
  }

  toggleTrueFalse(item: ExamItem, value: boolean) {
    this.answers.set({ ...this.answers(), [item.id]: value });
    this.saveProgress();
  }

  setEssay(item: ExamItem, text: string) {
    this.answers.set({ ...this.answers(), [item.id]: text });
    // debounce save for essay answers to reduce writes
    if (this.essayDebounceHandles[item.id]) {
      clearTimeout(this.essayDebounceHandles[item.id]);
    }
    this.essayDebounceHandles[item.id] = setTimeout(() => {
      this.saveProgress();
      delete this.essayDebounceHandles[item.id];
    }, 600); // 600ms debounce
  }

  answeredCount() {
    return Object.keys(this.answers()).length;
  }

  submit() {
    if (!this.exam() || this.submitting()) return;
    this.persistTaken(false);
  }

  private autoSubmit() {
    if (!this.exam() || this.submitting()) return;
    this.persistTaken(true);
  }

  private persistTaken(auto: boolean) {
    this.submitting.set(true);
    const user = this.auth.currentUser();
    if (!user) {
      this.error.set('Not authenticated');
      this.submitting.set(false);
      return;
    }
    const existing: TakenExamRecord[] = JSON.parse(
      localStorage.getItem('takenExams') || '[]'
    );
    const answersTable: TakenExamAnswer[] = JSON.parse(
      localStorage.getItem('takenExamAnswers') || '[]'
    );
    const existingIdx = existing.findIndex(
      (r) => r.examId === this.exam()!.id && r.userId === user.id
    );
    const nowIso = new Date().toISOString();
    if (existingIdx === -1) {
      // Should not happen because ensureDraftRecord creates draft, but handle gracefully
      const attemptId = crypto.randomUUID();
      const record: TakenExamRecord = {
        id: attemptId,
        examId: this.exam()!.id,
        userId: user.id,
        startedAt: this.startedAtIso || nowIso,
        submittedAt: nowIso,
        totalPoints: this.totalPoints(),
      };
      existing.push(record);
      // write answers rows
      this.items().forEach((it) => {
        answersTable.push({
          attemptId,
          itemId: it.id,
          type: it.type,
          answer: this.answers()[it.id] ?? null,
        });
      });
    } else {
      const attempt = existing[existingIdx];
      existing[existingIdx] = { ...attempt, submittedAt: nowIso };
      // upsert answers into answers table
      this.items().forEach((it) => {
        const ansIdx = answersTable.findIndex(
          (a) => a.attemptId === attempt.id && a.itemId === it.id
        );
        const payload: TakenExamAnswer = {
          attemptId: attempt.id,
          itemId: it.id,
          type: it.type,
          answer: this.answers()[it.id] ?? null,
        };
        if (ansIdx === -1) answersTable.push(payload);
        else answersTable[ansIdx] = { ...answersTable[ansIdx], ...payload };
      });
    }
    localStorage.setItem('takenExams', JSON.stringify(existing));
    localStorage.setItem('takenExamAnswers', JSON.stringify(answersTable));
    this.submitting.set(false);
    // navigate to summary (could reuse same route with query)
    this.router.navigate(['/student/exams']);
  }

  progressPercent() {
    const total = this.items().length || 1;
    return Math.round((this.answeredCount() / total) * 100);
  }

  private ensureDraftRecord() {
    const user = this.auth.currentUser();
    if (!user || !this.exam()) return;
    const key = 'takenExams';
    const list: (TakenExamRecord & { answers?: any })[] = JSON.parse(
      localStorage.getItem(key) || '[]'
    );
    // migration: if older records have embedded answers, extract them
    const answersTable: TakenExamAnswer[] = JSON.parse(
      localStorage.getItem('takenExamAnswers') || '[]'
    );
    let migrated = false;
    list.forEach((rec) => {
      if ((rec as any).answers) {
        const attemptId = rec.id;
        // only migrate if not already present
        (rec as any).answers.forEach((a: any) => {
          if (
            !answersTable.find(
              (row) => row.attemptId === attemptId && row.itemId === a.itemId
            )
          ) {
            answersTable.push({
              attemptId,
              itemId: a.itemId,
              type: a.type,
              answer: a.answer,
            });
            migrated = true;
          }
        });
        delete (rec as any).answers;
        migrated = true;
      }
    });
    if (migrated) {
      localStorage.setItem('takenExamAnswers', JSON.stringify(answersTable));
      localStorage.setItem(
        key,
        JSON.stringify(
          list.map((r) => ({
            id: r.id,
            examId: r.examId,
            userId: r.userId,
            startedAt: r.startedAt,
            submittedAt: r.submittedAt,
            totalPoints: r.totalPoints,
            score: r.score,
          }))
        )
      );
    }
    const idx = list.findIndex(
      (r) => r.examId === this.exam()!.id && r.userId === user.id
    );
    if (idx !== -1) {
      const rec = list[idx];
      if (rec.submittedAt) {
        // already completed; redirect to exams (prevent retake for now)
        this.error.set('You have already submitted this exam.');
        return;
      }
      // load answers from answers table
      const attemptAnswers: TakenExamAnswer[] = answersTable.filter(
        (a) => a.attemptId === rec.id
      );
      const restored: Record<string, any> = {};
      attemptAnswers.forEach((a) => (restored[a.itemId] = a.answer));
      this.answers.set(restored);
      this.startedAtIso = rec.startedAt;
      this.attemptId = rec.id;
    } else {
      // create draft record (submittedAt null)
      const draft: TakenExamRecord = {
        id: crypto.randomUUID(),
        examId: this.exam()!.id,
        userId: user.id,
        startedAt: new Date().toISOString(),
        submittedAt: null,
        totalPoints: this.totalPoints(),
      };
      list.push(draft);
      localStorage.setItem(key, JSON.stringify(list));
      this.startedAtIso = draft.startedAt;
      this.attemptId = draft.id;
    }
  }

  private saveProgress() {
    const user = this.auth.currentUser();
    if (!user || !this.exam()) return;
    const key = 'takenExams';
    const list: TakenExamRecord[] = JSON.parse(
      localStorage.getItem(key) || '[]'
    );
    const answersTable: TakenExamAnswer[] = JSON.parse(
      localStorage.getItem('takenExamAnswers') || '[]'
    );
    const idx = list.findIndex(
      (r) => r.examId === this.exam()!.id && r.userId === user.id
    );
    if (idx === -1) return; // draft not present (shouldn't happen)
    if (list[idx].submittedAt) return; // already submitted
    const attemptId = list[idx].id;
    // upsert each answer row
    this.items().forEach((it) => {
      const ansIdx = answersTable.findIndex(
        (a) => a.attemptId === attemptId && a.itemId === it.id
      );
      const payload: TakenExamAnswer = {
        attemptId,
        itemId: it.id,
        type: it.type,
        answer: this.answers()[it.id] ?? null,
      };
      if (ansIdx === -1) answersTable.push(payload);
      else answersTable[ansIdx] = { ...answersTable[ansIdx], ...payload };
    });
    localStorage.setItem('takenExamAnswers', JSON.stringify(answersTable));
    // store attempts back (unchanged aside from potential future fields)
    localStorage.setItem(key, JSON.stringify(list));
  }
}
