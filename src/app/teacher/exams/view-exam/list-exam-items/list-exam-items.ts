import {
  ExamItem,
  ExamItemService,
} from './../../../services/exam-item.service';
import { ActivatedRoute } from '@angular/router';
import { Component, inject, OnInit, signal } from '@angular/core';
import { McqItem } from './mcq-item/mcq-item';
import { HttpClient } from '@angular/common/http';
import { TrueFalseItem } from './true-false-item/true-false-item';
import { EssayItem } from './essay-item/essay-item';
import { UpdateItem } from './update-item/update-item';
import { DeleteItem } from './delete-item/delete-item';
import { environment } from '../../../../../environments/environment.development';
import { ExamService } from '../../../services/exam.service';
import { EssayFormModal } from './create-item/essay-form-modal/essay-form-modal';
import { McqFormModal } from './create-item/mcq-form-modal/mcq-form-modal';
import { TrueOrFalseFormModal } from './create-item/true-or-false-form-modal/true-or-false-form-modal';

@Component({
  selector: 'app-teacher-list-exam-items',
  imports: [
    McqItem,
    TrueFalseItem,
    EssayItem,
    UpdateItem,
    DeleteItem,
    EssayFormModal,
    McqFormModal,
    TrueOrFalseFormModal,
  ],
  templateUrl: './list-exam-items.html',
  styleUrl: './list-exam-items.css',
})
export class ListExamItems implements OnInit {
  http = inject(HttpClient);
  activatedRoute = inject(ActivatedRoute);
  examService = inject(ExamService);
  examItemService = inject(ExamItemService);

  isUpdateModalOpenSig = signal(false);
  selectedForUpdateSig = signal<ExamItem | null>(null);
  isDeleteModalOpenSig = signal(false);
  // easy modals
  isEasyTOFModalOpen = signal(false);
  isEasyEssayModalOpen = signal(false);
  isEasyMcqModalOpen = signal(false);
  // moderate modals
  isModerateTOFModalOpen = signal(false);
  isModerateEssayModalOpen = signal(false);
  isModerateMcqModalOpen = signal(false);
  // difficult modals
  isDifficultTOFModalOpen = signal(false);
  isDifficultEssayModalOpen = signal(false);
  isDifficultMcqModalOpen = signal(false);

  // collapsible states
  isEasyOpen = signal(true);
  isModerateOpen = signal(true);
  isDifficultOpen = signal(true);

  ngOnInit(): void {
    const examId: number =
      this.activatedRoute.parent?.snapshot.params['examId'];

    this.getExamItems(examId);
  }

  getExamItems(examId: number) {
    this.examItemService.index(examId).subscribe({
      next: (items) => {
        this.examItemService.items.set(items);
      },
      error: (err) => {
        console.error('Error fetching exam items:', err);
      },
    });
  }

  addItem(item: ExamItem) {
    this.examItemService.items.update((items) => [...items, item]);
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
    const itemId = updated.id;

    this.http
      .patch<{ item: ExamItem }>(
        `${environment.apiBaseUrl}/teacher/exams/${
          this.examService.viewingExam()?.id
        }/items/${itemId}`,
        updated
      )
      .subscribe({
        next: (res) => {
          this.examItemService.items.update((items) =>
            items.map((it) => (it.id === res.item.id ? res.item : it))
          );
          this.closeUpdateModal();
        },
      });
  }

  removeItem(item: ExamItem) {
    this.examItemService.items.update((items) =>
      items.filter((i) => i.id !== item.id)
    );
  }
}
