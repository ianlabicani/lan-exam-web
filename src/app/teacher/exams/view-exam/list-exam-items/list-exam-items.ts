import { ExamItem, ListExamItemsService } from './list-exam-items.service';
import { ActivatedRoute } from '@angular/router';
import { Component, inject, OnInit, signal } from '@angular/core';
import { McqItem } from './mcq-item/mcq-item';
import { HttpClient } from '@angular/common/http';
import { TrueFalseItem } from './true-false-item/true-false-item';
import { EssayItem } from './essay-item/essay-item';
import { FillBlankItem } from './fill-blank-item/fill-blank-item';
import { ShortAnswerItem } from './short-answer-item/short-answer-item';
import { MatchingItem } from './matching-item/matching-item';
import { UpdateItem } from './update-item/update-item';
import { DeleteItem } from './delete-item/delete-item';
import { environment } from '../../../../../environments/environment.development';
import { ExamService } from '../../../services/exam.service';
import { EssayFormModal } from './create-item/essay-form-modal/essay-form-modal';
import { McqFormModal } from './create-item/mcq-form-modal/mcq-form-modal';
import { TrueOrFalseFormModal } from './create-item/true-or-false-form-modal/true-or-false-form-modal';
import { FillBlankFormModal } from './create-item/fill-blank-form-modal/fill-blank-form-modal';
import { ShortAnswerFormModal } from './create-item/short-answer-form-modal/short-answer-form-modal';
import { MatchingFormModal } from './create-item/matching-form-modal/matching-form-modal';

@Component({
  selector: 'app-teacher-list-exam-items',
  imports: [
    McqItem,
    TrueFalseItem,
    EssayItem,
    FillBlankItem,
    ShortAnswerItem,
    MatchingItem,
    UpdateItem,
    DeleteItem,
    EssayFormModal,
    McqFormModal,
    TrueOrFalseFormModal,
    FillBlankFormModal,
    ShortAnswerFormModal,
    MatchingFormModal,
  ],
  templateUrl: './list-exam-items.html',
  styleUrl: './list-exam-items.css',
})
export class ListExamItems implements OnInit {
  http = inject(HttpClient);
  activatedRoute = inject(ActivatedRoute);
  examService = inject(ExamService);
  listExamItemsSvc = inject(ListExamItemsService);

  isUpdateModalOpenSig = signal(false);
  selectedForUpdateSig = signal<ExamItem | null>(null);
  isDeleteModalOpenSig = signal(false);
  // easy modals
  isEasyTOFModalOpen = signal(false);
  isEasyEssayModalOpen = signal(false);
  isEasyMcqModalOpen = signal(false);
  isEasyFillBlankModalOpen = signal(false);
  isEasyShortAnswerModalOpen = signal(false);
  isEasyMatchingModalOpen = signal(false);
  // moderate modals
  isModerateTOFModalOpen = signal(false);
  isModerateEssayModalOpen = signal(false);
  isModerateMcqModalOpen = signal(false);
  isModerateFillBlankModalOpen = signal(false);
  isModerateShortAnswerModalOpen = signal(false);
  isModerateMatchingModalOpen = signal(false);
  // difficult modals
  isDifficultTOFModalOpen = signal(false);
  isDifficultEssayModalOpen = signal(false);
  isDifficultMcqModalOpen = signal(false);
  isDifficultFillBlankModalOpen = signal(false);
  isDifficultShortAnswerModalOpen = signal(false);
  isDifficultMatchingModalOpen = signal(false);

  // collapsible states
  isEasyOpen = signal(true);
  isModerateOpen = signal(true);
  isDifficultOpen = signal(true);

  items = signal<any[]>([]);

  ngOnInit(): void {
    const examId: number =
      this.activatedRoute.parent?.snapshot.params['examId'];

    this.listExamItemsSvc.index(examId).subscribe({
      next: (res) => {
        console.log('Fetched exam items:', res);
      },
    });

    this.getExamItems(examId);
  }

  getExamItems(examId: number) {
    this.listExamItemsSvc.index(examId).subscribe({
      next: (items) => {
        this.listExamItemsSvc.items.set(items);
      },
      error: (err) => {
        console.error('Error fetching exam items:', err);
      },
    });
  }

  addItem(item: ExamItem) {
    this.listExamItemsSvc.items.update((items) => [...items, item]);
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
          this.listExamItemsSvc.items.update((items) =>
            items.map((it) => (it.id === res.item.id ? res.item : it))
          );
          this.closeUpdateModal();
        },
      });
  }

  removeItem(item: ExamItem) {
    this.listExamItemsSvc.items.update((items) =>
      items.filter((i) => i.id !== item.id)
    );
  }
}

interface GetItemsData {
  id: number;
  exam_id: number;
  type: string;
  question: string;
  points: number;
  expected_answer: null;
  answer: string;
  options: null;
  pairs: null;
  created_at: Date;
  updated_at: Date;
  level: string;
}
