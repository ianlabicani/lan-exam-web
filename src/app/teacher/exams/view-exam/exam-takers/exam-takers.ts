import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { IUser } from '../../../../auth/services/auth.service';

interface TakenExamRecord {
  id: string;
  examId: string;
  userId: string;
  startedAt: string;
  submittedAt: string | null;
  totalPoints?: number;
  score?: number;
}

interface TakenExamAnswer {
  attemptId: string;
  itemId: string;
  type: 'mcq' | 'truefalse' | 'essay';
  answer: any;
  pointsAwarded?: number;
}

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
  totalPoints?: number;
}

@Component({
  selector: 'app-exam-takers',
  imports: [RouterLink, DatePipe, UpperCasePipe],
  templateUrl: './exam-takers.html',
  styleUrl: './exam-takers.css',
})
export class ExamTakers implements OnInit {
  private route = inject(ActivatedRoute);
  exam = signal<ExamMeta | null>(null);
  attempts = signal<TakenExamRecord[]>([]);
  answers = signal<TakenExamAnswer[]>([]);
  items = signal<ExamItem[]>([]);
  users = signal<IUser[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }
    const exams: ExamMeta[] = JSON.parse(localStorage.getItem('exams') || '[]');
    this.exam.set(exams.find((e) => e.id === id) || null);
    const examItems: ExamItem[] = JSON.parse(
      localStorage.getItem('examItems') || '[]'
    );
    this.items.set(examItems.filter((i) => i.examId === id));
    const attempts: TakenExamRecord[] = JSON.parse(
      localStorage.getItem('takenExams') || '[]'
    );
    this.attempts.set(attempts.filter((a) => a.examId === id));
    const allAnswers: TakenExamAnswer[] = JSON.parse(
      localStorage.getItem('takenExamAnswers') || '[]'
    );
    this.answers.set(
      allAnswers.filter((a) =>
        this.attempts().some((at) => at.id === a.attemptId)
      )
    );
    const db = JSON.parse(localStorage.getItem('database') || '{}');
    this.users.set((db.users || []) as IUser[]);
    this.loading.set(false);
  }

  userFor(id: string) {
    return this.users().find((u) => u.id === Number(id)) || null;
  }

  attemptAnswersCount(attemptId: string) {
    return this.answers().filter(
      (a) =>
        a.attemptId === attemptId &&
        a.answer !== null &&
        a.answer !== undefined &&
        a.answer !== ''
    ).length;
  }

  isSubmitted(attempt: TakenExamRecord) {
    return !!attempt.submittedAt;
  }

  progressPercent(attempt: TakenExamRecord) {
    const total = this.items().length || 1;
    return Math.round((this.attemptAnswersCount(attempt.id) / total) * 100);
  }
}
