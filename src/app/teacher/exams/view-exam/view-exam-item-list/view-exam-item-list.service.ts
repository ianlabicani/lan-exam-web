import { inject, Injectable, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IExam } from '../../exam.service';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViewExamItemListService implements OnInit {
  http = inject(HttpClient);

  itemsSig = signal<IExamItem[]>([]);

  ngOnInit(): void {}

  getExamItems(examId: number) {
    return this.http
      .get<{ items: IExamItem[] }>(
        `http://127.0.0.1:8000/api/teacher/exams/${examId}/items`
      )
      .pipe(
        map((res) => {
          this.itemsSig.set(res.items);
          return res;
        })
      );
  }

  addItem(item: IExamItem) {
    this.itemsSig.update((items) => [...items, item]);
  }

  removeItem(item: IExamItem) {
    this.itemsSig.update((items) => items.filter((i) => i.id !== item.id));
  }
}

interface IExamItem {
  id: number;
  exam_id: number;
  type: string;
  question: string;
  points: number;
  expected_answer: null;
  answer: null;
  options: Option[];
  created_at: Date;
  updated_at: Date;
}

interface Option {
  text: string;
  correct: boolean;
}
