import { ViewExamService } from './view-exam.service';
import { EssayForm } from './forms/essay-form/essay-form';
import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  input,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgClass, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamService, IExam } from '../exam.service';
import { McqForm } from './forms/mcq-form/mcq-form';
import { TrueOrFalseForm } from './forms/true-or-false-form/true-or-false-form';
import { ViewExamItemList } from './view-exam-item-list/view-exam-item-list';

@Component({
  selector: 'app-view-exam',
  imports: [
    RouterLink,
    DatePipe,
    UpperCasePipe,
    FormsModule,
    McqForm,
    TrueOrFalseForm,
    EssayForm,
    ViewExamItemList,
  ],
  templateUrl: './view-exam.html',
  styleUrl: './view-exam.css',
})
export class ViewExam implements OnInit {
  examId = input.required<number>();

  viewExamService = inject(ViewExamService);
  private route = inject(ActivatedRoute);
  private examService = inject(ExamService);

  exam = signal<IExam | null>(null);
  editingItemId = signal<number | null>(null);
  tf = { question: '', answer: 'true', points: 1 };
  essay = { question: '', expectedAnswer: '', points: 5 };
  loading = signal(true);
  saving = signal(false);
  errorMsg = signal<string | null>(null);

  isEditable = computed(() => this.exam()?.status === 'draft');

  ngOnInit(): void {
    this.fetchExam(this.examId());
  }

  private fetchExam(id: number) {
    this.loading.set(true);
    this.viewExamService.getExam(id).subscribe({
      next: (exam) => {
        this.exam.set(exam);
        console.log(exam);

        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to load exam');
        this.loading.set(false);
      },
    });
  }

  onEssayItemCreated(item: IExam['items'][number]) {}

  statusBadge(status?: string) {
    const map: Record<string, string> = {
      active: 'bg-blue-100 text-blue-700',
      published: 'bg-green-100 text-green-700',
      draft: 'bg-gray-100 text-gray-700',
      archived: 'bg-yellow-100 text-yellow-700',
    };
    return status
      ? map[status] || 'bg-gray-100 text-gray-700'
      : 'bg-gray-100 text-gray-700';
  }

  // Lifecycle helpers

  allowedNextStatuses(): { value: IExam['status']; label: string }[] {
    const current = this.exam()?.status;
    if (!current) return [];
    const map: Record<IExam['status'], IExam['status'][]> = {
      draft: ['published', 'archived'],
      published: ['active', 'archived'],
      active: ['archived'],
      archived: [],
    };
    return (map[current] || []).map((s) => ({ value: s, label: s }));
  }

  updateStatus(next: IExam['status']) {
    if (!this.exam()) return;
    const current = this.exam()!;
    if (current.status === next) return;
    const valid = this.allowedNextStatuses().some((s) => s.value === next);
    if (!valid) return;
    this.saving.set(true);
    this.examService.updateExamStatus(current.id, next).subscribe({
      next: (res) => {
        this.exam.set(res.exam);
        this.saving.set(false);
        if (!this.isEditable()) this.editingItemId.set(null);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to update status');
        this.saving.set(false);
      },
    });
  }

  onMcqItemCreated(item: IExam['items'][number]) {
    // this.viewExamItemsService.examItemsSig.set([
    //   item,
    //   ...this.viewExamItemsService.examItemsSig(),
    // ]);
  }

  onTfItemCreated(item: IExam['items'][number]) {
    // this.viewExamItemsService.examItemsSig.set([
    //   item,
    //   ...this.viewExamItemsService.examItemsSig(),
    // ]);
  }

  addTrueFalse() {
    if (!this.exam()) return;
    const q = this.tf.question.trim();
    if (!q) return;
    this.saving.set(true);
    this.examService
      .createItem(this.exam()!.id, {
        type: 'truefalse',
        question: q,
        points: this.tf.points || 1,
        answer: this.tf.answer === 'true',
      })
      .subscribe({
        next: (res) => {
          // this.viewExamItemsService.examItemsSig.set([
          //   res.item,
          //   ...this.viewExamItemsService.examItemsSig(),
          // ]);
          this.tf = { question: '', answer: 'true', points: 1 };
          this.saving.set(false);
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Failed to add item');
          this.saving.set(false);
        },
      });
  }

  addEssay() {
    if (!this.exam()) return;
    const q = this.essay.question.trim();
    if (!q) return;
    this.saving.set(true);
    this.examService
      .createItem(this.exam()!.id, {
        type: 'essay',
        question: q,
        points: this.essay.points || 5,
        expected_answer: this.essay.expectedAnswer.trim() || null,
      })
      .subscribe({
        next: (res) => {
          // this.viewExamItemsService.examItemsSig.set([
          //   res.item,
          //   ...this.viewExamItemsService.examItemsSig(),
          // ]);
          this.essay = { question: '', expectedAnswer: '', points: 5 };
          this.saving.set(false);
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Failed to add essay');
          this.saving.set(false);
        },
      });
  }

  // no longer needed (mcq form handles its own reset)

  startEdit(id: number) {
    this.editingItemId.set(id);
  }

  cancelEdit() {
    this.editingItemId.set(null);
    // reload from API for consistency
    if (this.exam()) this.fetchExam(this.exam()!.id);
  }

  saveEdit(item: IExam['items'][number]) {
    this.saving.set(true);
    const payload: any = {
      question: item.question,
      points: item.points,
    };
    if (item.type === 'mcq') payload.options = item.options;
    if (item.type === 'truefalse') payload.answer = item.answer;
    if (item.type === 'essay') payload.expected_answer = item.expected_answer;
    this.examService.updateItem(item.id, payload, this.exam()!.id).subscribe({
      next: (res) => {
        // this.viewExamItemsService.examItemsSig.set(
        //   this.viewExamItemsService
        //     .examItemsSig()
        //     .map((i) => (i.id === res.item.id ? res.item : i))
        // );
        this.editingItemId.set(null);
        this.saving.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to update item');
        this.saving.set(false);
      },
    });
  }

  deleteItem(id: string | number) {
    if (!confirm('Delete this item?')) return;
    this.saving.set(true);
    this.examService.deleteItem(id).subscribe({
      next: () => {
        // this.viewExamItemsService.examItemsSig.set(
        //   this.viewExamItemsService.examItemsSig().filter((i) => i.id !== id)
        // );
        this.saving.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to delete item');
        this.saving.set(false);
      },
    });
  }
}
