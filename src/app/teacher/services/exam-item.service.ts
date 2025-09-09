import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Exam } from './exam.service';

@Injectable({
  providedIn: 'root',
})
export class ExamItemService {
  private http = inject(HttpClient);
  viewingExamSig = signal<Exam | null>(null);

  index(examId: number) {
    return this.http.get<ExamItem[]>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/items`
    );
  }
}

export interface ExamItem {
  id: number;
  exam_id: number;
  type: string;
  question: string;
  points: number;
  expected_answer: null;
  answer: null;
  options: Option[];
  created_at: Date;
  updated_at: Date;
}

export interface Option {
  text: string;
  correct: boolean;
}
