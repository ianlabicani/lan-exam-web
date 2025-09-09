import { computed, inject, Injectable, signal } from '@angular/core';
import { IExam } from '../exams.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViewExamService {
  http = inject(HttpClient);

  exam = signal<IExam | null>(null);

  totalPointsSig = computed(() =>
    this.exam()?.items.reduce((s, i) => s + (i.points || 0), 0)
  );
  mcqCountSig = computed(
    () => this.exam()?.items.filter((i) => i.type === 'mcq').length
  );
  tfCountSig = computed(
    () => this.exam()?.items.filter((i) => i.type === 'truefalse').length
  );
  essayCountSig = computed(
    () => this.exam()?.items.filter((i) => i.type === 'essay').length
  );

  getExam(id: number) {
    return this.http
      .get<IExam>(`http://127.0.0.1:8000/api/teacher/exams/${id}`)
      .pipe(
        map((res) => {
          this.exam.set(res);
          return res;
        })
      );
  }
}
