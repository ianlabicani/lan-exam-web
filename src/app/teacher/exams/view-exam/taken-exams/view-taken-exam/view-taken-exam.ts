import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import {
  faCheckCircle,
  faTimesCircle,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { McqAnswerComponent } from './answer-components/mcq-answer/mcq-answer';
import { TruefalsAnswerComponent } from './answer-components/truefalse-answer/truefalse-answer';
import { EssayAnswerComponent } from './answer-components/essay-answer/essay-answer';
import { FillblankAnswerComponent } from './answer-components/fillblank-answer/fillblank-answer';
import { ShortanswerAnswerComponent } from './answer-components/shortanswer-answer/shortanswer-answer';
import { MatchingAnswerComponent } from './answer-components/matching-answer/matching-answer';

@Component({
  selector: 'app-view-taken-exam',
  imports: [
    DatePipe,
    NgClass,
    TitleCasePipe,
    McqAnswerComponent,
    TruefalsAnswerComponent,
    EssayAnswerComponent,
    FillblankAnswerComponent,
    ShortanswerAnswerComponent,
    MatchingAnswerComponent,
  ],
  templateUrl: './view-taken-exam.html',
  styleUrl: './view-taken-exam.css',
})
export class ViewTakenExam implements OnInit {
  http = inject(HttpClient);
  route = inject(ActivatedRoute);

  // Icons
  protected readonly faCheckCircle = faCheckCircle;
  protected readonly faTimesCircle = faTimesCircle;
  protected readonly faArrowRight = faArrowRight;

  exam = signal<Exam | null>(null);
  examTaker = signal<TakenExam | null>(null);
  answerComparisons = signal<AnswerComparison[]>([]);
  totalPoints = signal(0);

  // Helper methods for answer comparison using the backend comparison data
  isAnswerCorrect(answer: AnswerElement): boolean {
    const comparison = this.getAnswerComparison(answer.exam_item_id);
    // Prefer authoritative comparison result (from backend)
    if (
      comparison &&
      comparison.is_correct !== null &&
      comparison.is_correct !== undefined
    ) {
      return comparison.is_correct === true;
    }
    // If comparison has explicit points_earned use that
    if (
      comparison &&
      comparison.points_earned !== null &&
      comparison.points_earned !== undefined
    ) {
      return comparison.points_earned > 0;
    }
    // Fallback to answer-level points_earned when available
    if (answer.points_earned !== null && answer.points_earned !== undefined) {
      return answer.points_earned > 0;
    }
    // No grading info yet
    return false;
  }

  getAnswerComparison(examItemId: number): AnswerComparison | null {
    const comparisons = this.answerComparisons();
    return comparisons.find((comp) => comp.exam_item_id === examItemId) || null;
  }

  getCorrectMcqOptionIndex(answer: AnswerElement): number | null {
    if (answer.item.type !== 'mcq' || !answer.item.options) return null;
    return answer.item.options.findIndex((option) => option.correct);
  }

  getCorrectAnswersCount(): number {
    const comparisons = this.answerComparisons();
    return comparisons.filter((comp) => {
      // If it has points_earned, check if points > 0 (manually graded)
      // Otherwise check is_correct (auto-graded)
      if (comp.points_earned !== null && comp.points_earned !== undefined) {
        return comp.points_earned > 0;
      }
      return comp.type !== 'essay' && comp.is_correct === true;
    }).length;
  }

  getTotalGradableAnswers(): number {
    const comparisons = this.answerComparisons();
    return comparisons.filter((comp) => comp.type !== 'essay').length;
  }

  getEssayAnswersCount(): number {
    const comparisons = this.answerComparisons();
    return comparisons.filter((comp) => comp.type === 'essay').length;
  }

  getAccuracyRate(): number {
    const total = this.getTotalGradableAnswers();
    if (total === 0) return 0;
    return (this.getCorrectAnswersCount() / total) * 100;
  }

  parseJson(data: any): any {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
    return data;
  }

  isCorrectMatch(studentPair: any, expectedPairs: any[]): boolean {
    if (!expectedPairs || !Array.isArray(expectedPairs)) {
      return false;
    }
    if (!studentPair) {
      return false;
    }
    // Now both use {left, right} format after normalization
    const result = expectedPairs.some(
      (p) => p?.left === studentPair.left && p?.right === studentPair.right
    );
    return result;
  }

  getCorrectRightValue(leftValue: string, expectedPairs: any[]): string | null {
    if (!expectedPairs || !Array.isArray(expectedPairs)) {
      return null;
    }
    const pair = expectedPairs.find((p) => p?.left === leftValue);
    return pair?.right ?? null;
  }

  getIncorrectMatches(studentPairs: any[], expectedPairs: any[]): any[] {
    if (!studentPairs || !Array.isArray(studentPairs)) {
      return [];
    }
    return studentPairs.filter(
      (pair) => !this.isCorrectMatch(pair, expectedPairs)
    );
  }

  getCorrectMatches(studentPairs: any[], expectedPairs: any[]): any[] {
    if (!studentPairs || !Array.isArray(studentPairs)) {
      return [];
    }
    return studentPairs.filter((pair) =>
      this.isCorrectMatch(pair, expectedPairs)
    );
  }

  isArrayType(value: any): boolean {
    return Array.isArray(value);
  }

  ngOnInit(): void {
    const examTakerId = this.route.snapshot.paramMap.get('examTakerId');
    const examId = this.route.parent?.snapshot.paramMap.get('examId');

    if (!examTakerId) {
      return;
    }

    this.http
      .get<TakenExamResponse>(
        `http://127.0.0.1:8000/api/teacher/exams/${examId}/taken-exams/${examTakerId}`
      )
      .subscribe({
        next: (res) => {
          console.log(res);

          this.exam.set(res.exam);
          this.examTaker.set(res.takenExam);
          this.answerComparisons.set(res.comparison);
          const points = res.comparison.reduce(
            (sum, comp) => sum + (comp.points_earned ?? 0),
            0
          );
          this.totalPoints.set(points);
        },
        error: () => {
          this.exam.set(null);
          this.examTaker.set(null);
          this.answerComparisons.set([]);
        },
      });
  }
}

interface TakenExamResponse {
  exam: Exam;
  takenExam: TakenExam;
  comparison: AnswerComparison[];
  activityLogs: ActivityLog[];
}

interface TakenExam {
  id: number;
  exam_id: number;
  user_id: number;
  started_at: Date;
  submitted_at: Date;
  status: string;
  total_points: number;
  created_at: Date;
  updated_at: Date;
  user: User;
  answers: AnswerElement[];
  exam: Exam;
}

interface AnswerComparison {
  exam_item_id: number;
  type: Type;
  question: string;
  points: number;
  points_earned: number;
  correct_answer: any;
  student_answer: any;
  is_correct: boolean | null;
  answered: boolean;
  options?: Option[] | null;
  pairs?: any[] | null;
  expected_answer?: string | null;
}

interface AnswerElement {
  id: number;
  taken_exam_id: number;
  exam_item_id: number;
  answer: boolean | number | string;
  points_earned: number;
  feedback?: string | null;
  created_at: Date;
  updated_at: Date;
  item: Item;
}

interface Item {
  id: number;
  exam_id: number;
  type: Type;
  question: string;
  points: number;
  expected_answer: null | string;
  answer: null | string;
  options: Option[] | null;
  pairs: { left: string; right: string }[] | null;
  left?: string[] | null;
  right?: string[] | null;
  created_at: Date;
  updated_at: Date;
  level: Level;
}

enum Level {
  Difficult = 'difficult',
  Easy = 'easy',
  Moderate = 'moderate',
}

interface Option {
  text: string;
  correct: boolean;
}

enum Type {
  Essay = 'essay',
  Mcq = 'mcq',
  Truefalse = 'truefalse',
  FillBlank = 'fill_blank',
  ShortAnswer = 'shortanswer',
  Matching = 'matching',
}

interface Exam {
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

interface To {
  topic: string;
  outcomes: any[];
  time_allotment: number;
  no_of_items: number;
  distribution: Distribution;
}

interface Distribution {
  easy: Difficult;
  moderate: Difficult;
  difficult: Difficult;
}

interface Difficult {
  allocation: number;
  placement: any[];
}

interface User {
  id: number;
  name: string;
  email: string;
  year: string;
  section: string;
  email_verified_at: null;
  created_at: Date;
  updated_at: Date;
}

interface ActivityLog {
  id: number;
  taken_exam_id: number;
  student_id: number;
  event_type: string;
  details: {
    timestamp: string;
    user_agent: string;
    ip_address: string;
  };
  created_at: Date;
  updated_at: Date;
}
