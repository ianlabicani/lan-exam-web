import { ActivatedRoute } from '@angular/router';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { McqItem } from './ui/mcq-item/mcq-item';
import { HttpClient } from '@angular/common/http';
import { TrueFalseItem } from './ui/true-false-item/true-false-item';
import { EssayItem } from './ui/essay-item/essay-item';
import { FillBlankItem } from './ui/fill-blank-item/fill-blank-item';
import { ShortAnswerItem } from './ui/short-answer-item/short-answer-item';
import { MatchingItem } from './ui/matching-item/matching-item';
import { DeleteItem } from './delete-item/delete-item';
import { EssayFormModal } from './create-item/essay-form-modal/essay-form-modal';
import { McqFormModal } from './create-item/mcq-form-modal/mcq-form-modal';
import { TrueOrFalseFormModal } from './create-item/true-or-false-form-modal/true-or-false-form-modal';
import { FillBlankFormModal } from './create-item/fill-blank-form-modal/fill-blank-form-modal';
import { ShortAnswerFormModal } from './create-item/short-answer-form-modal/short-answer-form-modal';
import { MatchingFormModal } from './create-item/matching-form-modal/matching-form-modal';
import { ExamItem, ViewExamService } from '../view-exam.service';
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
  examApi = inject(ExamApiService);

  selectedForUpdateSig = signal<ExamItem | null>(null);
  isDeleteModalOpenSig = signal(false);

  // Edit modal state
  selectedEditItemType = signal<string | null>(null);

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

  items = computed(() => this.viewExamSvc.viewingExam()?.items ?? []);

  /**
   * Computed accessor for easy difficulty items
   */
  easyItems = computed(() =>
    this.items().filter((item) => item.level === 'easy')
  );

  /**
   * Computed accessor for moderate difficulty items
   */
  moderateItems = computed(() =>
    this.items().filter((item) => item.level === 'moderate')
  );

  /**
   * Computed accessor for difficult items
   */
  difficultItems = computed(() =>
    this.items().filter((item) => item.level === 'difficult')
  );

  ngOnInit(): void {}

  openEditModal(item: ExamItem): void {
    this.selectedForUpdateSig.set(item);
    this.selectedEditItemType.set(item.type);
  }

  closeEditModal(): void {
    this.selectedForUpdateSig.set(null);
    this.selectedEditItemType.set(null);
  }

  isEditingItemType(type: string): boolean {
    return (
      this.selectedEditItemType() === type &&
      this.selectedForUpdateSig() !== null
    );
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
