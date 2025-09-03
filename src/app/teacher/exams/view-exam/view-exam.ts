import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgClass, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamService, IExam, IItem } from '../exam.service';
import { McqForm } from './mcq-form/mcq-form';

@Component({
  selector: 'app-view-exam',
  imports: [RouterLink, DatePipe, NgClass, UpperCasePipe, FormsModule, McqForm],
  templateUrl: './view-exam.html',
  styleUrl: './view-exam.css',
})
export class ViewExam implements OnInit {
  private route = inject(ActivatedRoute);
  exam = signal<IExam | null>(null);
  items = signal<IItem[]>([]);
  editingItemId = signal<number | null>(null);
  // creation model states
  // mcq creation handled inside mcq form now
  tf = { question: '', answer: 'true', points: 1 };
  essay = { question: '', expectedAnswer: '', points: 5 };
  loading = signal(true);
  saving = signal(false);
  errorMsg = signal<string | null>(null);
  private examService = inject(ExamService);

  totalPoints = computed(() =>
    this.items().reduce((s, i) => s + (i.points || 0), 0)
  );
  mcqCount = computed(
    () => this.items().filter((i) => i.type === 'mcq').length
  );
  tfCount = computed(
    () => this.items().filter((i) => i.type === 'truefalse').length
  );
  essayCount = computed(
    () => this.items().filter((i) => i.type === 'essay').length
  );

  isEditable = computed(() => this.exam()?.status === 'draft');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.fetchExam(+id);
  }

  private fetchExam(id: number) {
    this.loading.set(true);
    this.examService.getExam(id).subscribe({
      next: (exam) => {
        console.log(exam);
        this.exam.set(exam);
        const items = exam.items || [];
        this.items.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to load exam');
        this.loading.set(false);
      },
    });
  }

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

  onMcqItemCreated(item: IItem) {
    this.items.set([item, ...this.items()]);
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
          this.items.set([res.item, ...this.items()]);
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
          this.items.set([res.item, ...this.items()]);
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

  saveEdit(item: IItem) {
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
        this.items.set(
          this.items().map((i) => (i.id === res.item.id ? res.item : i))
        );
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
        this.items.set(this.items().filter((i) => i.id !== id));
        this.saving.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to delete item');
        this.saving.set(false);
      },
    });
  }
}
