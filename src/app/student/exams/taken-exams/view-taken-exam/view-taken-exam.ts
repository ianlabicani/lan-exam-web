import { ActivatedRoute, RouterLink } from '@angular/router';
import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StudentExamItemService } from '../../../services/student-exam-item.service';
import { concatMap } from 'rxjs';
import { ExamHeader } from '../create-taken-exam/exam-header/exam-header';
import { ExamQuestion } from '../create-taken-exam/exam-question/exam-question';
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
  imports: [ExamHeader, ExamQuestion, DatePipe, RouterLink, FaIconComponent],
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
          this.takenExamSig.set(takenExam.takenExam);
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
