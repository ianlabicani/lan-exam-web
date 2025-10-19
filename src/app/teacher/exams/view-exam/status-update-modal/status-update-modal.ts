import {
  Component,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  faSync,
  faTimes,
  faExclamationCircle,
  faCheckCircle,
  faArrowLeft,
  faArrowRight,
  faExclamationTriangle,
  faPencilAlt,
  faCheckSquare,
  faLock,
  faClipboardList,
  faArchive,
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Tos, ViewingExam } from '../view-exam.service';

@Component({
  selector: 'app-status-update-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, FaIconComponent],
  templateUrl: './status-update-modal.html',
  styleUrl: './status-update-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusUpdateModalComponent {
  exam = input<ViewingExam | null>(null);
  isOpen = input<boolean>(false);
  isSaving = input<boolean>(false);

  closeModal = output<void>();
  submitStatusUpdate = output<string>();

  selectedStatus = signal<string | null>(null);
  faSync = faSync;
  faTimes = faTimes;
  faExclamationCircle = faExclamationCircle;
  faCheckCircle = faCheckCircle;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  faExclamationTriangle = faExclamationTriangle;
  faPencilAlt = faPencilAlt;
  faCheckSquare = faCheckSquare;
  faLock = faLock;
  faClipboardList = faClipboardList;
  faArchive = faArchive;

  // Status lifecycle
  private lifecycle: Array<
    | 'draft'
    | 'ready'
    | 'published'
    | 'ongoing'
    | 'closed'
    | 'graded'
    | 'archived'
  > = [
    'draft',
    'ready',
    'published',
    'ongoing',
    'closed',
    'graded',
    'archived',
  ];

  // Computed properties
  currentStatusIndex = computed(() => {
    const status = this.exam()?.status;
    return status ? this.lifecycle.indexOf(status as any) : -1;
  });

  canGoBack = computed(() => this.currentStatusIndex() > 0);

  canGoForward = computed(() => {
    const idx = this.currentStatusIndex();
    return idx >= 0 && idx < this.lifecycle.length - 1;
  });

  previousStatus = computed(() => {
    const idx = this.currentStatusIndex();
    return idx > 0 ? this.lifecycle[idx - 1] : null;
  });

  nextStatus = computed(() => {
    const idx = this.currentStatusIndex();
    return idx >= 0 && idx < this.lifecycle.length - 1
      ? this.lifecycle[idx + 1]
      : null;
  });

  // Calculate requirements from TOS
  requiredAllocations = computed(() => {
    const exam = this.exam();
    const tosData = exam?.tos || [];

    const allocations = {
      easy: 0,
      moderate: 0,
      difficult: 0,
    };

    tosData.forEach((topic: Tos) => {
      if (topic.distribution) {
        allocations.easy += topic.distribution.easy?.allocation || 0;
        allocations.moderate += topic.distribution.moderate?.allocation || 0;
        allocations.difficult += topic.distribution.difficult?.allocation || 0;
      }
    });

    return allocations;
  });

  // Count current items by level
  itemCounts = computed(() => {
    const exam = this.exam();
    const items = exam?.items || [];

    const counts = {
      easy: 0,
      moderate: 0,
      difficult: 0,
    };

    items.forEach((item: any) => {
      const level = item.level || 'easy';
      if (level in counts) {
        counts[level as keyof typeof counts]++;
      }
    });

    return counts;
  });

  // Check if requirements are met
  requirementsMet = computed(() => {
    const required = this.requiredAllocations();
    const current = this.itemCounts();

    return (
      current.easy >= required.easy &&
      current.moderate >= required.moderate &&
      current.difficult >= required.difficult &&
      (this.exam()?.items?.length || 0) > 0
    );
  });

  // Show requirements section
  showRequirementsCheck = computed(() => {
    const status = this.exam()?.status;
    return status === 'draft' || status === 'published';
  });

  constructor() {
    // Reset selected status when modal opens
    effect(() => {
      if (this.isOpen()) {
        this.selectedStatus.set(null);
      }
    });
  }

  onClose() {
    this.closeModal.emit();
  }

  onSubmit() {
    const status = this.selectedStatus();
    if (status) {
      this.submitStatusUpdate.emit(status);
    }
  }

  isNextStatusDisabled(): boolean {
    const status = this.exam()?.status;
    return (
      !this.requirementsMet() && (status === 'draft' || status === 'published')
    );
  }

  getMissingItems(level: 'easy' | 'moderate' | 'difficult'): number {
    const required = this.requiredAllocations()[level];
    const current = this.itemCounts()[level];
    return Math.max(0, required - current);
  }

  getNextStatusDescription(status: string | null): string {
    switch (status) {
      case 'ready':
        return 'Mark as ready for review';
      case 'published':
        return 'Publish exam to students';
      case 'ongoing':
        return 'Start the exam period';
      case 'closed':
        return 'Close exam submissions';
      case 'graded':
        return 'Mark grading as complete';
      case 'archived':
        return 'Archive this exam';
      default:
        return 'Move to the next stage';
    }
  }

  getStatusColor(status: string | undefined): string {
    switch (status) {
      case 'draft':
        return 'px-4 py-2 bg-gray-200 text-gray-800 text-base font-bold rounded-lg shadow-md border-2 border-gray-400';
      case 'ready':
        return 'px-4 py-2 bg-amber-400 text-amber-900 text-base font-bold rounded-lg shadow-md border-2 border-amber-500';
      case 'published':
        return 'px-4 py-2 bg-green-500 text-white text-base font-bold rounded-lg shadow-md border-2 border-green-600';
      case 'ongoing':
        return 'px-4 py-2 bg-blue-500 text-white text-base font-bold rounded-lg shadow-lg border-2 border-blue-600 animate-pulse';
      case 'closed':
        return 'px-4 py-2 bg-orange-500 text-white text-base font-bold rounded-lg shadow-md border-2 border-orange-600';
      case 'graded':
        return 'px-4 py-2 bg-indigo-500 text-white text-base font-bold rounded-lg shadow-md border-2 border-indigo-600';
      case 'archived':
        return 'px-4 py-2 bg-red-500 text-white text-base font-bold rounded-lg shadow-md border-2 border-red-600 opacity-75';
      default:
        return 'px-4 py-2 bg-gray-200 text-gray-800 rounded-lg';
    }
  }
}
