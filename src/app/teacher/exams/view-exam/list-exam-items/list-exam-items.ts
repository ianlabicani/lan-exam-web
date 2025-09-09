import { ActivatedRoute } from '@angular/router';
import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { McqItem } from './mcq-item/mcq-item';
import { HttpClient } from '@angular/common/http';
import { CreateItem } from './create-item/create-item';
import { ExamsService, IExam } from '../../exams.service';

@Component({
  selector: 'app-teacher-list-exam-items',
  imports: [NgClass, McqItem, CreateItem],
  templateUrl: './list-exam-items.html',
  styleUrl: './list-exam-items.css',
})
export class ListExamItems implements OnInit {
  http = inject(HttpClient);
  activatedRoute = inject(ActivatedRoute);
  examsService = inject(ExamsService);

  examIdSig = signal<number>(0);
  examItemsSig = signal<IExamItem[]>([]);
  examSig = signal<IExam | null>(null);

  ngOnInit(): void {
    this.activatedRoute.parent?.params.subscribe((params) => {
      const examIdParam = params['examId'];
      this.examIdSig.set(+examIdParam);
    });
    this.getExamItems(this.examIdSig());
    this.examsService.getExam(this.examIdSig()).subscribe((exam) => {
      this.examSig.set(exam);
    });
  }

  getExamItems(examId: number) {
    this.http
      .get<{ items: IExamItem[] }>(
        `http://127.0.0.1:8000/api/teacher/exams/${examId}/items`
      )
      .subscribe({
        next: (res) => {
          this.examItemsSig.set(res.items);
          console.log(res);
        },
        error: (err) => {
          console.error('Error fetching exam items:', err);
        },
      });
  }

  addItem(item: IExamItem) {
    this.examItemsSig.update((items) => [...items, item]);
  }

  removeItem(item: IExamItem) {
    this.examItemsSig.update((items) => items.filter((i) => i.id !== item.id));
  }
}

export interface IExamItem {
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

export interface Option {
  text: string;
  correct: boolean;
}
