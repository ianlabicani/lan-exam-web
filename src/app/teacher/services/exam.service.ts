import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  private http = inject(HttpClient);
  viewingExam = signal<Exam | null>(null);
  exams = signal<Exam[]>([]);

  index() {
    return this.http.get<Exam[]>(`${environment.apiBaseUrl}/teacher/exams`);
  }

  show(id: number) {
    return this.http.get<Exam>(`${environment.apiBaseUrl}/teacher/exams/${id}`);
  }

  store(payload: any) {
    return this.http.post<{ exam: Exam }>(
      `${environment.apiBaseUrl}/teacher/exams`,
      payload
    );
  }

  updateStatus(id: number | string, status: string) {
    return this.http.patch<Exam>(
      `${environment.apiBaseUrl}/teacher/exams/${id}/status`,
      { status }
    );
  }
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  starts_at: string | Date;
  ends_at: string | Date;
  year: string;
  // New API may return sections as an array; keep old 'section' for compatibility
  section?: string;
  sections?: string[];
  status: string;
  total_points: number;
  // Table of Specifications (optional)
  tos?: TosTopic[];
  created_at: string | Date;
  updated_at: string | Date;
}

export interface TosTopic {
  topic: string;
  outcomes: string[];
  time_allotment: number;
  no_of_items: number;
  distribution: TosDistribution;
}

export interface TosDistribution {
  easy: TosDistributionLevel;
  moderate: TosDistributionLevel;
  difficult: TosDistributionLevel;
}

export interface TosDistributionLevel {
  allocation: number;
  placement: string[];
}
