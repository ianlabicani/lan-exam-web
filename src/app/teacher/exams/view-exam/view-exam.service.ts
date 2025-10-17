import { inject, Injectable, signal } from '@angular/core';
import { Exam } from '../../services/exam.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ViewExamService {
  http = inject(HttpClient);

  exam = signal<Exam | null>(null);

  show(id: number) {
    return this.http.get<{ data: { exam: Exam } }>(
      `${environment.apiBaseUrl}/teacher/exams/${id}`
    );
  }

  updateStatus(id: number | string, status: string) {
    return this.http.patch<Exam>(
      `${environment.apiBaseUrl}/teacher/exams/${id}/status`,
      { status }
    );
  }
}
