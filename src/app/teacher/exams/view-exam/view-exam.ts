import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgClass, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamService, IExam, Item } from '../exam.service';

@Component({
  selector: 'app-view-exam',
  imports: [RouterLink, DatePipe, NgClass, UpperCasePipe, FormsModule],
  templateUrl: './view-exam.html',
  styleUrl: './view-exam.css',
})
export class ViewExam implements OnInit {
  private route = inject(ActivatedRoute);
  exam = signal<IExam | null>(null);
  items = signal<Item[]>([]);
  editingItemId = signal<number | null>(null);
  // creation model states
  mcq = {
    question: '',
    options: [
      { id: crypto.randomUUID(), text: '', correct: false },
      { id: crypto.randomUUID(), text: '', correct: false },
      { id: crypto.randomUUID(), text: '', correct: false },
      { id: crypto.randomUUID(), text: '', correct: false },
    ],
    points: 1,
  };
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
  isEditable() {
    return this.exam()?.status === 'draft';
  }

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
        this.exam.set(res.exam as any);
        this.saving.set(false);
        if (!this.isEditable()) this.editingItemId.set(null);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to update status');
        this.saving.set(false);
      },
    });
  }

  // Item creation
  addMcq() {
    if (!this.exam()) return;
    const q = this.mcq.question.trim();
    const opts = this.mcq.options.filter((o) => o.text.trim());
    if (!q || opts.length < 2 || !opts.some((o) => o.correct)) return;
    this.saving.set(true);
    this.examService
      .createItem(this.exam()!.id, {
        type: 'mcq',
        question: q,
        points: this.mcq.points || 1,
        options: opts.map((o) => ({ text: o.text, correct: o.correct })),
      })
      .subscribe({
        next: (res) => {
          this.items.set([res.item, ...this.items()]);
          this.resetMcq();
          this.saving.set(false);
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Failed to add MCQ');
          this.saving.set(false);
        },
      });
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

  private resetMcq() {
    this.mcq.question = '';
    this.mcq.options = [
      { id: crypto.randomUUID(), text: '', correct: false },
      { id: crypto.randomUUID(), text: '', correct: false },
      { id: crypto.randomUUID(), text: '', correct: false },
      { id: crypto.randomUUID(), text: '', correct: false },
    ];
    this.mcq.points = 1;
  }

  startEdit(id: number) {
    this.editingItemId.set(id);
  }

  cancelEdit() {
    this.editingItemId.set(null);
    // reload from API for consistency
    if (this.exam()) this.fetchExam(this.exam()!.id);
  }

  saveEdit(item: Item) {
    this.saving.set(true);
    const payload: any = {
      question: item.question,
      points: item.points,
    };
    if (item.type === 'mcq') payload.options = item.options;
    if (item.type === 'truefalse') payload.answer = item.answer;
    if (item.type === 'essay') payload.expected_answer = item.expected_answer;
    this.examService.updateItem(item.id, payload).subscribe({
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
