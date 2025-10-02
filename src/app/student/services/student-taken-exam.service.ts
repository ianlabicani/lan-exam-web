import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ITakenExam } from './student-exam.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentTakenExamService {
  http = inject(HttpClient);

  private takenExam = signal<ITakenExam | null>(null);
  takenExam$ = this.takenExam.asReadonly();

  create(examId: number) {
    return this.http.post<{ taken_exam: ITakenExam }>(
      `http://127.0.0.1:8000/api/student/exams/${examId}/take`,
      {}
    );
  }

  getOne(takenExamId: number) {
    return this.http
      .get<{ takenExam: ITakenExam }>(
        `http://127.0.0.1:8000/api/student/taken-exams/${takenExamId}`
      )
      .pipe(tap((res) => this.takenExam.set(res.takenExam)));
  }

  getAll() {
    return this.http.get<{ data: ITakenExam[] }>(
      `http://127.0.0.1:8000/api/student/taken-exams`
    );
  }
}
