import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faExclamationTriangle,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-submit-modal',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    @if (isOpen) {
    <!-- Modal Backdrop -->
    <div
      class="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      (click)="onBackdropClick()"
    >
      <!-- Modal Content -->
      <div
        class="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 transform transition-transform duration-300"
        (click)="$event.stopPropagation()"
      >
        <!-- Icon -->
        <div
          class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4"
        >
          <fa-icon
            [icon]="faExclamationTriangle"
            class="text-yellow-600 text-2xl"
          ></fa-icon>
        </div>

        <!-- Title & Message -->
        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Submit Exam?</h3>
          <p class="text-gray-600">
            Are you sure you want to submit your exam? This action cannot be
            undone.
          </p>
        </div>

        <!-- Summary -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-gray-600">Answered:</span>
            <span class="font-semibold text-gray-900"
              >{{ answeredCount }} / {{ totalQuestions }}</span
            >
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Unanswered:</span>
            <span
              class="font-semibold"
              [class.text-red-600]="unansweredCount > 0"
              [class.text-green-600]="unansweredCount === 0"
            >
              {{ unansweredCount }}
            </span>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex space-x-3">
          <button
            (click)="onClose.emit()"
            [disabled]="isSubmitting"
            class="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            (click)="onSubmit.emit()"
            [disabled]="isSubmitting"
            class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (isSubmitting) {
            <fa-icon [icon]="faCheckCircle" class="mr-2 animate-spin"></fa-icon>
            <span>Submitting...</span>
            } @else {
            <span>Submit</span>
            }
          </button>
        </div>
      </div>
    </div>
    }
  `,
  styleUrl: './submit-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmitModal {
  @Input() isOpen = false;
  @Input() answeredCount = 0;
  @Input() totalQuestions = 0;
  @Input() isSubmitting = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<void>();

  faExclamationTriangle = faExclamationTriangle;
  faCheckCircle = faCheckCircle;

  get unansweredCount(): number {
    return this.totalQuestions - this.answeredCount;
  }

  onBackdropClick(): void {
    if (!this.isSubmitting) {
      this.onClose.emit();
    }
  }
}
