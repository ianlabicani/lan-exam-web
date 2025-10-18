import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

/**
 * Pure HTTP API service for exam endpoints.
 * This service only handles HTTP calls and returns raw observables.
 * No state management, no signals, no normalization - just HTTP.
 */
@Injectable({
  providedIn: 'root',
})
export class ExamApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/teacher/exams`;

  // ========== EXAMS ==========
  index(params?: Record<string, string | number>) {
    let url = this.apiUrl;
    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryString.append(key, String(value));
      });
      url += `?${queryString.toString()}`;
    }
    return this.http.get<{
      data: any[];
      meta?: { total: number; current_page: number; per_page: number };
    }>(url);
  }

  show(id: number | string) {
    return this.http.get<{ data: any }>(`${this.apiUrl}/${id}`);
  }

  store(payload: any) {
    return this.http.post<{ data: any }>(this.apiUrl, payload);
  }

  update(id: number | string, payload: any) {
    return this.http.patch<{ data: any }>(`${this.apiUrl}/${id}`, payload);
  }

  updateStatus(id: number | string, status: string) {
    return this.http.patch<{ data: any }>(`${this.apiUrl}/${id}/status`, {
      status,
    });
  }

  destroy(id: number | string) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // ========== ANALYTICS ==========
  getExamAnalytics(examId: number | string) {
    return this.http.get<{ data: any }>(`${this.apiUrl}/${examId}/analytics`);
  }

  // ========== ACTIVITY LOGS ==========
  getActivityLogs(takenExamId: number | string) {
    return this.http.get<{ data: any }>(
      `${environment.apiBaseUrl}/teacher/taken-exams/${takenExamId}/activity-logs`
    );
  }
}
