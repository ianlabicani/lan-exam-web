import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ITakenExam } from './student-exam.service';

@Injectable({
  providedIn: 'root',
})
export class StudentTakenExamService {
  http = inject(HttpClient);

  create(examId: number) {
    return this.http.post<{ taken_exam: ITakenExam }>(
      `http://127.0.0.1:8000/api/student/exams/${examId}/take`,
      {}
    );
  }

  getOne(takenExamId: number) {
    return this.http.get<{ data: ITakenExam }>(
      `http://127.0.0.1:8000/api/student/taken-exams/${takenExamId}`
    );
  }
}
