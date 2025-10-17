import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Exam } from '../../services/exam.service';

@Injectable({
  providedIn: 'root',
})
export class ExamApiService {
  private http = inject(HttpClient);

  show(id: number): Observable<{ data: { exam: Exam } }> {
    return this.http.get<{ data: { exam: Exam } }>(
      `${environment.apiBaseUrl}/teacher/exams/${id}`
    );
  }

  updateStatus(id: number | string, status: string): Observable<Exam> {
    return this.http.patch<Exam>(
      `${environment.apiBaseUrl}/teacher/exams/${id}/status`,
      { status }
    );
  }

  listItems(examId: number): Observable<any> {
    return this.http.get<{ data: any }>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/items`
    );
  }

  createItem(examId: number, payload: any): Observable<any> {
    return this.http.post<{ data: any }>(
      `${environment.apiBaseUrl}/teacher/exams/${examId}/items`,
      payload
    );
  }

  updateItem(item: any): Observable<any> {
    return this.http.patch<{ data: any }>(
      `${environment.apiBaseUrl}/teacher/exams/items/${item.id}`,
      item
    );
  }

  deleteItem(itemId: number): Observable<any> {
    return this.http.delete<{ data: any }>(
      `${environment.apiBaseUrl}/teacher/exams/items/${itemId}`
    );
  }
}
