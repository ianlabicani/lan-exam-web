import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-view-taken-exam',
  imports: [DatePipe, NgClass, TitleCasePipe],
  templateUrl: './view-taken-exam.html',
  styleUrl: './view-taken-exam.css',
})
export class ViewTakenExam implements OnInit {
  http = inject(HttpClient);
  route = inject(ActivatedRoute);

  examTaker = signal<TakenExam | null>(null);
  answerComparisons = signal<AnswerComparison[]>([]);

  // Helper methods for answer comparison using the backend comparison data
  isAnswerCorrect(answer: AnswerElement): boolean {
    const comparison = this.getAnswerComparison(answer.exam_item_id);
    return comparison?.is_correct === true;
  }

  getAnswerComparison(examItemId: number): AnswerComparison | null {
    const comparisons = this.answerComparisons();
    return comparisons.find((comp) => comp.exam_item_id === examItemId) || null;
  }

  getCorrectMcqOptionIndex(answer: AnswerElement): number | null {
    if (answer.type !== 'mcq' || !answer.item.options) return null;
    return answer.item.options.findIndex((option) => option.correct);
  }

  getCorrectAnswersCount(): number {
    const comparisons = this.answerComparisons();
    return comparisons.filter(
      (comp) => comp.type !== 'essay' && comp.is_correct === true
    ).length;
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

  ngOnInit(): void {
    const examTakerId = this.route.snapshot.paramMap.get('examTakerId');
    const examId = this.route.parent?.snapshot.paramMap.get('examId');

    this.route.params.subscribe((params) => {
      console.log(params);
    });
    console.log(examId, examTakerId);

    if (!examTakerId) {
      console.log('no id');
      return;
    }

    this.http
      .get<TakenExamResponse>(
        `http://127.0.0.1:8000/api/teacher/exams/${examId}/takenExams/${examTakerId}`
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          this.examTaker.set(res.data);
          this.answerComparisons.set(res.answer_comparison);
        },
        error: () => {
          this.examTaker.set(null);
          this.answerComparisons.set([]);
        },
      });
  }
}

interface TakenExamResponse {
  data: TakenExam;
  answer_comparison: AnswerComparison[];
}

interface TakenExam {
  id: number;
  exam_id: number;
  type: Type;
  user_id: number;
  started_at: Date;
  submitted_at: Date;
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
  correct_answer: any;
  student_answer: any;
  is_correct: boolean | null;
  answered: boolean;
}

interface AnswerElement {
  id: number;
  taken_exam_id: number;
  exam_item_id: number;
  type: Type;
  answer: boolean | number | string;
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
  pairs: null;
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
