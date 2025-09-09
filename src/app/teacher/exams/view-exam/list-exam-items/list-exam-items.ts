import {
  ExamItem,
  ExamItemService,
} from './../../../services/exam-item.service';
import { ActivatedRoute } from '@angular/router';
import { Component, inject, OnInit, signal } from '@angular/core';
import { McqItem } from './mcq-item/mcq-item';
import { HttpClient } from '@angular/common/http';
import { EssayForm } from './create-item/essay-form/essay-form';
import { McqForm } from './create-item/mcq-form/mcq-form';
import { TrueOrFalseForm } from './create-item/true-or-false-form/true-or-false-form';
import { TrueFalseItem } from './true-false-item/true-false-item';
import { EssayItem } from './essay-item/essay-item';
import { UpdateItem } from './update-item/update-item';
import { DeleteItem } from './delete-item/delete-item';
import { environment } from '../../../../../environments/environment.development';
import { ExamService } from '../../../services/exam.service';

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
  examService = inject(ExamService);
  examItemService = inject(ExamItemService);

  examIdSig = signal<number>(0);
  examItemsSig = signal<ExamItem[]>([]);
  examSig = this.examService.viewingExamSig;
  isFormVisibleSig = signal(false);
  isUpdateModalOpenSig = signal(false);
  selectedForUpdateSig = signal<ExamItem | null>(null);
  isDeleteModalOpenSig = signal(false);

  ngOnInit(): void {
    const examId: number =
      this.activatedRoute.parent?.snapshot.params['examId'];

    this.getExamItems(examId);
  }

  getExamItems(examId: number) {
    this.examItemService.index(examId).subscribe({
      next: (items) => {
        this.examItemsSig.set(items);
      },
      error: (err) => {
        console.error('Error fetching exam items:', err);
      },
    });
  }

  addItem(item: ExamItem) {
    this.examItemsSig.update((items) => [...items, item]);
  }

  openUpdateModal(item: ExamItem) {
    this.selectedForUpdateSig.set(item);
    this.isUpdateModalOpenSig.set(true);
  }

  closeUpdateModal() {
    this.selectedForUpdateSig.set(null);
    this.isUpdateModalOpenSig.set(false);
  }

  openDeleteModal(item: ExamItem) {
    this.selectedForUpdateSig.set(item);
    this.isDeleteModalOpenSig.set(true);
  }

  closeDeleteModal() {
    this.selectedForUpdateSig.set(null);
    this.isDeleteModalOpenSig.set(false);
  }

  onItemDeleted(item: ExamItem) {
    this.removeItem(item);
    this.closeDeleteModal();
  }

  onItemSaved(updated: ExamItem) {
    const examId = this.examIdSig();
    const itemId = updated.id;

    this.http
      .patch<{ item: ExamItem }>(
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

  removeItem(item: ExamItem) {
    this.examItemsSig.update((items) => items.filter((i) => i.id !== item.id));
  }
}
