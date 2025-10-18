import { ActivatedRoute, RouterLink } from '@angular/router';
import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StudentExamItemService } from '../../../services/student-exam-item.service';
import { concatMap } from 'rxjs';
// Note: ExamHeader and ExamQuestion were removed from imports because they're not used in this template
import { ITakenExamAnswer } from '../create-taken-exam/create-taken-exam';
import { TakenExamService } from '../../../services/taken-exam.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment.development';
import {
  faArrowLeft,
  faCheckCircle,
  faClock,
  faArrowRight,
  faHourglassHalf,
  faHistory,
  faFileAlt,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-view-taken-exam',
  standalone: true,
  imports: [DatePipe, RouterLink, FaIconComponent],
  templateUrl: './view-taken-exam.html',
  styleUrl: './view-taken-exam.css',
})
export class ViewTakenExam implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  // FontAwesome icons
  faArrowLeft = faArrowLeft;
  faCheckCircle = faCheckCircle;
  faClock = faClock;
  faArrowRight = faArrowRight;
  faHourglassHalf = faHourglassHalf;
  faHistory = faHistory;
  faFileAlt = faFileAlt;
  faQuestionCircle = faQuestionCircle;

  takenExamSig = signal<TakenExam['takenExam'] | null>(null);
  examItems = signal<ExamItem[]>([]);
  answers = signal<Record<string, any>>({});

  ngOnInit(): void {
    this.getTakenExam();
  }

  getTakenExam() {
    const takenExamId = this.route.snapshot.params['takenExamId'];
    this.http
      .get<TakenExam>(
        `${environment.apiBaseUrl}/student/taken-exams/${takenExamId}`
      )
      .subscribe({
        next: (takenExam) => {
          // API responses may use different shapes/keys depending on controller branch:
          // - { takenExam: {...}, exam: {...} } (camelCase)
          // - { taken_exam: {...}, exam: {...} } (snake_case)
          // - or sometimes return the taken exam object directly
          const body: any = takenExam as any;

          // Support multiple shapes:
          // - { takenExam: {...}, exam: {...} }
          // - { taken_exam: {...}, exam: {...} }
          // - { data: { taken_exam: {...}, exam: {...} } }
          // - direct taken exam object
          const unwrap = (b: any) => {
            if (!b) return null;
            if (b.takenExam) return b.takenExam;
            if (b.taken_exam) return b.taken_exam;
            if (b.data) return unwrap(b.data);
            if (b.id && b.exam_id) return b; // looks like the taken exam itself
            return null;
          };

          const taken = unwrap(body);
          this.takenExamSig.set(taken ?? null);

          // Determine exam object and items
          const examObj =
            body.exam ??
            (taken ? taken.exam : null) ??
            (body.data ? body.data.exam : null);
          this.examItems.set(examObj?.items ?? []);

          // Populate answers
          const answers =
            taken && Array.isArray(taken.answers)
              ? taken.answers
              : body.answers ?? (body.data ? body.data.answers : null);
          if (Array.isArray(answers))
            this.setAnswers(answers as ITakenExamAnswer[]);

          console.log('takenExam API response resolved ->', {
            body,
            taken,
            examObj,
            answers,
          });
        },
        error: (err) => {
          console.error('Failed loading taken exam', err);
        },
      });
  }

  private setAnswers(answers: ITakenExamAnswer[]) {
    if (!answers?.length) return;
    const restored: Record<string, any> = {};
    answers.forEach((ans) => {
      const key = ans.exam_item_id;
      let value: any = ans.answer;
      if (ans.type === 'mcq') {
        const num = Number(value);
        if (!Number.isNaN(num)) value = num;
      } else if (ans.type === 'truefalse') {
        if (value === '1' || value === 1 || value === true || value === 'true')
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
        value = value ?? '';
        if (typeof value !== 'string') value = String(value);
      } else if (ans.type === 'matching') {
        try {
          if (typeof value === 'string') value = JSON.parse(value);
        } catch (_) {
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

  // Helpers for the template
  getAnswerObj(itemId: number) {
    const t = this.takenExamSig();
    if (!t?.answers) return null;
    return t.answers.find((a) => a.exam_item_id === itemId) || null;
  }

  getStudentAnswerText(item: ExamItem): string {
    const ans = this.getAnswerObj(item.id);
    if (!ans || ans.answer === null || ans.answer === undefined)
      return 'No answer provided';
    const v = ans.answer;

    if (item.type === 'mcq' && item.options) {
      const idx = Number(v);
      if (!Number.isNaN(idx) && item.options[idx]) {
        return typeof item.options[idx] === 'string'
          ? item.options[idx]
          : item.options[idx].text ?? String(item.options[idx]);
      }
      return String(v);
    }

    if (item.type === 'truefalse') {
      const s = String(v).toLowerCase();
      return s === '1' || s === 'true' || s === 'yes' ? 'True' : 'False';
    }

    if (item.type === 'matching') {
      try {
        return Array.isArray(v)
          ? JSON.stringify(v)
          : typeof v === 'string'
          ? v
          : String(v);
      } catch {
        return String(v);
      }
    }

    return String(v);
  }

  getCorrectAnswerText(item: ExamItem): string | null {
    if (item.type === 'mcq' && item.options) {
      const options = item.options;
      const correctIndex = options.findIndex((opt: any) => {
        if (typeof opt === 'string') return false;
        return !!opt?.correct;
      });
      if (correctIndex >= 0) {
        return typeof options[correctIndex] === 'string'
          ? options[correctIndex]
          : options[correctIndex].text ?? String(options[correctIndex]);
      }
      return null;
    }

    if (item.type === 'truefalse') {
      const s = String(item.answer).toLowerCase();
      return s === '1' || s === 'true' || s === 'yes' ? 'True' : 'False';
    }

    if (item.type === 'matching' && item.pairs) {
      return JSON.stringify(item.pairs);
    }

    if (item.expected_answer) return item.expected_answer;
    return null;
  }

  getAnswerPoints(itemId: number): number | null {
    const ans = this.getAnswerObj(itemId);
    return ans ? ans.points_earned ?? null : null;
  }

  // Determine correctness by comparing student answer and item's correct value where possible
  isItemCorrect(item: ExamItem): boolean | null {
    const ans = this.getAnswerObj(item.id);
    if (!ans) return null;

    const student = ans.answer;

    switch (item.type) {
      case 'mcq':
        if (!item.options) return null;
        const idx = Number(student);
        if (Number.isNaN(idx)) return null;
        const opt = item.options[idx];
        if (!opt) return null;
        // option may be object or string
        return typeof opt === 'string' ? null : !!opt.correct;

      case 'truefalse':
        const s = String(student).trim().toLowerCase();
        const expected = String(item.answer).trim().toLowerCase();
        if (!s || !expected) return null;
        const truthy = (v: string) => ['1', 'true', 'yes'].includes(v);
        return truthy(s) === truthy(expected);

      case 'fillblank':
      case 'fill_blank':
      case 'shortanswer':
        if (item.expected_answer == null) return null;
        return (
          String(student).trim().toLowerCase() ===
          String(item.expected_answer).trim().toLowerCase()
        );

      case 'matching':
        // cannot determine without comparison logic here
        return null;

      default:
        return null;
    }
  }

  totalQuestions(): number {
    return this.examItems().length;
  }

  answeredCount(): number {
    const t = this.takenExamSig();
    if (!t?.answers) return 0;
    return t.answers.filter((a) => a.answer !== null && a.answer !== undefined)
      .length;
  }

  correctCount(): number {
    const t = this.takenExamSig();
    if (!t?.answers) return 0;
    return t.answers.filter(
      (a) => a.points_earned !== null && a.points_earned === a.item.points
    ).length;
  }
}

export interface TakenExam {
  pending: boolean;
  message: string;
  takenExam: TakenExamClass;
  exam: Exam;
}

export interface Exam {
  id: number;
  title: string;
  description: null;
  starts_at: Date;
  ends_at: Date;
  year: string[];
  sections: string[];
  status: string;
  total_points: number;
  tos: To[];
  created_at: Date;
  updated_at: Date;
  items: ExamItem[];
}

export interface ExamItem {
  id: number;
  exam_id: number;
  type: string;
  level: Level;
  question: string;
  points: number;
  expected_answer: null | string;
  answer: null | string;
  options: Option[] | null;
  pairs: Pair[] | null;
  created_at: Date;
  updated_at: Date;
}

export enum Level {
  Difficult = 'difficult',
  Easy = 'easy',
  Moderate = 'moderate',
}

export interface Option {
  text: string;
  correct: boolean;
}

export interface Pair {
  left: string;
  right: string;
}

export interface To {
  topic: string;
  time_allotment: number;
  no_of_items: number;
  outcomes: any[];
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

export interface TakenExamClass {
  id: number;
  exam_id: number;
  user_id: number;
  started_at: Date;
  submitted_at: Date;
  status: string;
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
  answer: string;
  points_earned: number | null;
  feedback: null;
  created_at: Date;
  updated_at: Date;
  item: ExamItem;
}
