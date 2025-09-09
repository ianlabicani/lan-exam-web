import { ActivatedRoute } from '@angular/router';
import { Component, inject, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { McqItem } from './mcq-item/mcq-item';
import { HttpClient } from '@angular/common/http';
import { ExamsService, IExam } from '../../exams.service';
import { EssayForm } from './create-item/essay-form/essay-form';
import { McqForm } from './create-item/mcq-form/mcq-form';
import { TrueOrFalseForm } from './create-item/true-or-false-form/true-or-false-form';
import { environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-teacher-list-exam-items',
  imports: [NgClass, McqItem, McqForm, TrueOrFalseForm, EssayForm],
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
        `http://${environment.apiBaseUrl}/teacher/exams/${examId}/items`
      )
      .subscribe({
        next: (res) => {
          this.examItemsSig.set(res.items);
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
