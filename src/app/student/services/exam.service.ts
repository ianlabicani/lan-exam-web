import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Exam } from '../models/exam';

@Injectable()
export class ExamService {
  http = inject(HttpClient);

  getAll() {
    return this.http.get<{ data: Exam[] }>(
      `${environment.apiBaseUrl}/student/exams`
    );
  }

  getOne(examId: number) {
    return this.http.get<{ data: Exam }>(
      `${environment.apiBaseUrl}/student/exams/${examId}`
    );
  }

  takeExam(examId: number) {
    return this.http.get<{ data: any; taken_exam_id?: number }>(
      `${environment.apiBaseUrl}/student/taken-exams/create`,
      { params: { exam_id: examId } }
    );
  }
}
