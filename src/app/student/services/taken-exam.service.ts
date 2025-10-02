import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { TakenExam } from '../models/exam';
import { environment } from '../../../environments/environment.development';

@Injectable()
export class TakenExamService {
  http = inject(HttpClient);

  private takenExam = signal<TakenExam | null>(null);
  takenExam$ = this.takenExam.asReadonly();

  create(examId: number) {
    return this.http.post<{ taken_exam: TakenExam }>(
      `${environment.apiBaseUrl}/student/exams/${examId}/take`,
      {}
    );
  }

  getOne(takenExamId: number) {
    return this.http
      .get<{ takenExam: TakenExam }>(
        `${environment.apiBaseUrl}/student/taken-exams/${takenExamId}`
      )
      .pipe(tap((res) => this.takenExam.set(res.takenExam)));
  }

  getAll() {
    return this.http.get<{ data: TakenExam[] }>(
      `${environment.apiBaseUrl}/student/taken-exams`
    );
  }
}
