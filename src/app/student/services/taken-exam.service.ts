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
      .get<{ exam: any; taken_exam: any; takenExam?: any }>(
        `${environment.apiBaseUrl}/student/taken-exams/${takenExamId}/continue`
      )
      .pipe(
        tap((res) => {
          // Handle both response formats
          const takenExam = res.takenExam || res.taken_exam;
          this.takenExam.set(takenExam);
        })
      );
  }

  getAll() {
    return this.http.get<{ data: TakenExam[] }>(
      `${environment.apiBaseUrl}/student/taken-exams`
    );
  }
}
