import { ExamItem, ExamItemStateService } from './exam-item-state.service';
import { ActivatedRoute } from '@angular/router';
import { Component, inject, OnInit, signal } from '@angular/core';
import { McqItem } from './ui/mcq-item/mcq-item';
import { HttpClient } from '@angular/common/http';
import { TrueFalseItem } from './ui/true-false-item/true-false-item';
import { EssayItem } from './ui/essay-item/essay-item';
import { FillBlankItem } from './ui/fill-blank-item/fill-blank-item';
import { ShortAnswerItem } from './ui/short-answer-item/short-answer-item';
import { MatchingItem } from './ui/matching-item/matching-item';
import { UpdateItem } from './update-item/update-item';
import { DeleteItem } from './delete-item/delete-item';
import { EssayFormModal } from './create-item/essay-form-modal/essay-form-modal';
import { McqFormModal } from './create-item/mcq-form-modal/mcq-form-modal';
import { TrueOrFalseFormModal } from './create-item/true-or-false-form-modal/true-or-false-form-modal';
import { FillBlankFormModal } from './create-item/fill-blank-form-modal/fill-blank-form-modal';
import { ShortAnswerFormModal } from './create-item/short-answer-form-modal/short-answer-form-modal';
import { MatchingFormModal } from './create-item/matching-form-modal/matching-form-modal';
import { ViewExamService } from '../view-exam.service';
import { AddQuestionModal } from './add-question-modal/add-question-modal';
import { ExamApiService } from '../../../services/exam-api.service';

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
    AddQuestionModal,
  ],
  templateUrl: './list-exam-items.html',
  styleUrl: './list-exam-items.css',
})
export class ListExamItems implements OnInit {
  http = inject(HttpClient);
  activatedRoute = inject(ActivatedRoute);
  viewExamSvc = inject(ViewExamService);
  examApiSvc = inject(ExamApiService);
  itemsStateSvc = inject(ExamItemStateService);

  isUpdateModalOpenSig = signal(false);
  selectedForUpdateSig = signal<ExamItem | null>(null);
  isDeleteModalOpenSig = signal(false);

  // Add question modal states by difficulty level
  addQuestionModalLevel = signal<'easy' | 'moderate' | 'difficult' | null>(
    null
  );
  selectedQuestionType = signal<
    | 'mcq'
    | 'truefalse'
    | 'essay'
    | 'shortanswer'
    | 'matching'
    | 'fillblank'
    | null
  >(null);

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

  items = this.itemsStateSvc.items$;

  ngOnInit(): void {
    const examId: number =
      this.activatedRoute.parent?.snapshot.params['examId'];

    this.getExamItems(examId);
  }

  getExamItems(examId: number) {
    this.itemsStateSvc.index(examId).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.error('Error fetching exam items:', err);
      },
    });
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
    this.closeDeleteModal();
  }

  onItemSaved(examItem: ExamItem) {
    const examId = this.viewExamSvc.getViewingExamSnapshot()?.id;
    if (!examId) {
      console.error('No exam ID available');
      return;
    }
    // Call updateItem with explicit parameters
    const itemId = examItem.id;
    this.examApiSvc.updateItem(examId, itemId, examItem).subscribe({
      next: (res: any) => {
        // Update parent state with new exam data
        this.viewExamSvc.patchViewingExam(res.data);
        this.closeUpdateModal();
      },
      error: (err: any) => {
        console.error('Error updating item:', err);
      },
    });
  }

  openAddQuestionModal(level: 'easy' | 'moderate' | 'difficult') {
    this.addQuestionModalLevel.set(level);
  }

  closeAddQuestionModal() {
    this.addQuestionModalLevel.set(null);
    this.selectedQuestionType.set(null);
  }

  onQuestionTypeSelected(
    type:
      | 'mcq'
      | 'truefalse'
      | 'essay'
      | 'shortanswer'
      | 'matching'
      | 'fillblank'
  ) {
    this.selectedQuestionType.set(type);
    const level = this.addQuestionModalLevel();
    this.closeAddQuestionModal();

    // Open the appropriate modal based on type and level
    if (level === 'easy') {
      switch (type) {
        case 'mcq':
          this.isEasyMcqModalOpen.set(true);
          break;
        case 'truefalse':
          this.isEasyTOFModalOpen.set(true);
          break;
        case 'essay':
          this.isEasyEssayModalOpen.set(true);
          break;
        case 'shortanswer':
          this.isEasyShortAnswerModalOpen.set(true);
          break;
        case 'matching':
          this.isEasyMatchingModalOpen.set(true);
          break;
        case 'fillblank':
          this.isEasyFillBlankModalOpen.set(true);
          break;
      }
    } else if (level === 'moderate') {
      switch (type) {
        case 'mcq':
          this.isModerateMcqModalOpen.set(true);
          break;
        case 'truefalse':
          this.isModerateTOFModalOpen.set(true);
          break;
        case 'essay':
          this.isModerateEssayModalOpen.set(true);
          break;
        case 'shortanswer':
          this.isModerateShortAnswerModalOpen.set(true);
          break;
        case 'matching':
          this.isModerateMatchingModalOpen.set(true);
          break;
        case 'fillblank':
          this.isModerateFillBlankModalOpen.set(true);
          break;
      }
    } else if (level === 'difficult') {
      switch (type) {
        case 'mcq':
          this.isDifficultMcqModalOpen.set(true);
          break;
        case 'truefalse':
          this.isDifficultTOFModalOpen.set(true);
          break;
        case 'essay':
          this.isDifficultEssayModalOpen.set(true);
          break;
        case 'shortanswer':
          this.isDifficultShortAnswerModalOpen.set(true);
          break;
        case 'matching':
          this.isDifficultMatchingModalOpen.set(true);
          break;
        case 'fillblank':
          this.isDifficultFillBlankModalOpen.set(true);
          break;
      }
    }
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
