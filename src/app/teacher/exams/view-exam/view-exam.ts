import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgClass, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface StoredExamItem {
  id: string;
  examId: string;
  type: 'mcq' | 'truefalse' | 'essay';
  question: string;
  points: number;
  options?: { text: string; correct: boolean }[]; // mcq
  answer?: boolean; // truefalse
  expectedAnswer?: string; // essay
}

interface StoredExam {
  id: string;
  title: string;
  description?: string;
  startsAt?: string | Date;
  endsAt?: string | Date;
  duration?: number;
  status: 'draft' | 'published' | 'archived' | 'active';
  section: string;
  year: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  totalPoints: number;
}

@Component({
  selector: 'app-view-exam',
  imports: [RouterLink, DatePipe, NgClass, UpperCasePipe, FormsModule],
  templateUrl: './view-exam.html',
  styleUrl: './view-exam.css',
})
export class ViewExam implements OnInit {
  private route = inject(ActivatedRoute);
  exam = signal<StoredExam | null>(null);
  items = signal<StoredExamItem[]>([]);
  editingItemId = signal<string | null>(null);
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
    const exams: StoredExam[] = JSON.parse(
      localStorage.getItem('exams') || '[]'
    );
    const exam = exams.find((e) => e.id === id) || null;
    this.exam.set(exam);
    const allItems: StoredExamItem[] = JSON.parse(
      localStorage.getItem('examItems') || '[]'
    );
    this.items.set(allItems.filter((i) => i.examId === id));
    this.loading.set(false);
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

  allowedNextStatuses(): { value: StoredExam['status']; label: string }[] {
    const current = this.exam()?.status;
    if (!current) return [];
    const map: Record<StoredExam['status'], StoredExam['status'][]> = {
      draft: ['published', 'archived'],
      published: ['active', 'archived'],
      active: ['archived'],
      archived: [],
    };
    return (map[current] || []).map((s) => ({ value: s, label: s }));
  }

  updateStatus(next: StoredExam['status']) {
    if (!this.exam()) return;
    const current = this.exam()!;
    if (current.status === next) return;
    // validate transition
    const valid = this.allowedNextStatuses().some((s) => s.value === next);
    if (!valid) return;
    const exams: StoredExam[] = JSON.parse(
      localStorage.getItem('exams') || '[]'
    );
    const idx = exams.findIndex((e) => e.id === current.id);
    if (idx !== -1) {
      exams[idx] = {
        ...exams[idx],
        status: next,
        updatedAt: new Date(),
      } as StoredExam;
      localStorage.setItem('exams', JSON.stringify(exams));
      this.exam.set(exams[idx]);
    }
    // If exam becomes non-editable, clear editing state
    if (!this.isEditable()) {
      this.editingItemId.set(null);
    }
  }

  // Item creation
  addMcq() {
    if (!this.exam()) return;
    const q = this.mcq.question.trim();
    const opts = this.mcq.options.filter((o) => o.text.trim());
    if (!q || opts.length < 2 || !opts.some((o) => o.correct)) return;
    const item: StoredExamItem = {
      id: crypto.randomUUID(),
      examId: this.exam()!.id,
      type: 'mcq',
      question: q,
      options: opts.map((o) => ({ text: o.text, correct: o.correct })),
      points: this.mcq.points || 1,
    };
    this.persistItem(item);
    // reset
    this.mcq.question = '';
    this.mcq.options = [
      { id: crypto.randomUUID(), text: '', correct: false },
      { id: crypto.randomUUID(), text: '', correct: false },
      { id: crypto.randomUUID(), text: '', correct: false },
      { id: crypto.randomUUID(), text: '', correct: false },
    ];
    this.mcq.points = 1;
  }

  addTrueFalse() {
    if (!this.exam()) return;
    const q = this.tf.question.trim();
    if (!q) return;
    const item: StoredExamItem = {
      id: crypto.randomUUID(),
      examId: this.exam()!.id,
      type: 'truefalse',
      question: q,
      answer: this.tf.answer === 'true',
      points: this.tf.points || 1,
    };
    this.persistItem(item);
    this.tf = { question: '', answer: 'true', points: 1 };
  }

  addEssay() {
    if (!this.exam()) return;
    const q = this.essay.question.trim();
    if (!q) return;
    const item: StoredExamItem = {
      id: crypto.randomUUID(),
      examId: this.exam()!.id,
      type: 'essay',
      question: q,
      expectedAnswer: this.essay.expectedAnswer.trim() || undefined,
      points: this.essay.points || 5,
    };
    this.persistItem(item);
    this.essay = { question: '', expectedAnswer: '', points: 5 };
  }

  private persistItem(item: StoredExamItem) {
    const all: StoredExamItem[] = JSON.parse(
      localStorage.getItem('examItems') || '[]'
    );
    all.push(item);
    localStorage.setItem('examItems', JSON.stringify(all));
    this.items.set([item, ...this.items()]);
    this.updateExamPoints();
  }

  startEdit(id: string) {
    this.editingItemId.set(id);
  }

  cancelEdit() {
    this.editingItemId.set(null);
    // reload items from storage to discard edits
    if (this.exam()) {
      const all: StoredExamItem[] = JSON.parse(
        localStorage.getItem('examItems') || '[]'
      );
      this.items.set(all.filter((i) => i.examId === this.exam()!.id));
    }
  }

  saveEdit(item: StoredExamItem) {
    const all: StoredExamItem[] = JSON.parse(
      localStorage.getItem('examItems') || '[]'
    );
    const idx = all.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      all[idx] = item;
      localStorage.setItem('examItems', JSON.stringify(all));
      this.items.set(all.filter((i) => i.examId === this.exam()!.id));
      this.updateExamPoints();
    }
    this.editingItemId.set(null);
  }

  deleteItem(id: string) {
    if (!confirm('Delete this item?')) return;
    const all: StoredExamItem[] = JSON.parse(
      localStorage.getItem('examItems') || '[]'
    );
    const filtered = all.filter((i) => i.id !== id);
    localStorage.setItem('examItems', JSON.stringify(filtered));
    this.items.set(filtered.filter((i) => i.examId === this.exam()!.id));
    this.updateExamPoints();
  }

  private updateExamPoints() {
    if (!this.exam()) return;
    const total = this.items().reduce((s, i) => s + (i.points || 0), 0);
    const exams: StoredExam[] = JSON.parse(
      localStorage.getItem('exams') || '[]'
    );
    const idx = exams.findIndex((e) => e.id === this.exam()!.id);
    if (idx !== -1) {
      exams[idx].totalPoints = total;
      exams[idx].updatedAt = new Date();
      localStorage.setItem('exams', JSON.stringify(exams));
      this.exam.set(exams[idx]);
    }
  }
}
