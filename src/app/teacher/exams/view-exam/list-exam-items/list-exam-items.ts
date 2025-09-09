import { ActivatedRoute } from '@angular/router';
import { Component, inject, OnInit, signal } from '@angular/core';
import { McqItem } from './mcq-item/mcq-item';
import { HttpClient } from '@angular/common/http';
import { ExamsService, IExam } from '../../exams.service';
import { EssayForm } from './create-item/essay-form/essay-form';
import { McqForm } from './create-item/mcq-form/mcq-form';
import { TrueOrFalseForm } from './create-item/true-or-false-form/true-or-false-form';
import { TrueFalseItem } from './true-false-item/true-false-item';
import { EssayItem } from './essay-item/essay-item';
import { UpdateItem } from './update-item/update-item';
import { DeleteItem } from './delete-item/delete-item';
import { environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-teacher-list-exam-items',
  imports: [
    McqItem,
    McqForm,
    TrueOrFalseForm,
    EssayForm,
    TrueFalseItem,
    EssayItem,
    UpdateItem,
    DeleteItem,
  ],
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
  isFormVisibleSig = signal(false);
  isUpdateModalOpenSig = signal(false);
  selectedForUpdateSig = signal<IExamItem | null>(null);
  isDeleteModalOpenSig = signal(false);

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
        `${environment.apiBaseUrl}/teacher/exams/${examId}/items`
      )
      .subscribe({
        next: (res) => {
          this.examItemsSig.set(res.items);
          console.log(res.items);
        },
        error: (err) => {
          console.error('Error fetching exam items:', err);
        },
      });
  }

  addItem(item: IExamItem) {
    this.examItemsSig.update((items) => [...items, item]);
  }

  openUpdateModal(item: IExamItem) {
    this.selectedForUpdateSig.set(item);
    this.isUpdateModalOpenSig.set(true);
  }

  closeUpdateModal() {
    this.selectedForUpdateSig.set(null);
    this.isUpdateModalOpenSig.set(false);
  }

  openDeleteModal(item: IExamItem) {
    this.selectedForUpdateSig.set(item);
    this.isDeleteModalOpenSig.set(true);
  }

  closeDeleteModal() {
    this.selectedForUpdateSig.set(null);
    this.isDeleteModalOpenSig.set(false);
  }

  onItemDeleted(item: IExamItem) {
    this.removeItem(item);
    this.closeDeleteModal();
  }

  onItemSaved(updated: IExamItem) {
    const examId = this.examIdSig();
    const itemId = updated.id;

    this.http
      .patch<{ item: IExamItem }>(
        `${environment.apiBaseUrl}/teacher/exams/${examId}/items/${itemId}`,
        updated
      )
      .subscribe({
        next: (res) => {
          this.examItemsSig.update((items) =>
            items.map((it) => (it.id === res.item.id ? res.item : it))
          );
          this.closeUpdateModal();
        },
      });
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
