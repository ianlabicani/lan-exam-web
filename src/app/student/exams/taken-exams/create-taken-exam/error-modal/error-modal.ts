import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      (click)="handleBackdropClick()"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        (click)="$event.stopPropagation()"
      >
        <!-- Icon -->
        <div class="flex justify-center mb-4">
          <div class="bg-red-100 rounded-full p-3">
            <svg
              class="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4v2m0 0v2m0-2h2m0 0h2m0 0h-2m0 0h-2M9 7h6m0 0h2m0 0h-2m0 0h-2"
              />
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h3 class="text-lg font-bold text-gray-900 text-center mb-2">Error</h3>

        <!-- Message -->
        <p class="text-gray-600 text-center mb-6">
          {{ message() }}
        </p>

        <!-- Close Button -->
        <button
          (click)="onClose.emit()"
          class="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition duration-200"
        >
          Close
        </button>
      </div>
    </div>
    }
  `,
  styles: ``,
})
export class ErrorModal {
  isOpen = input.required<boolean>();
  message = input.required<string>();
  onClose = output<void>();

  handleBackdropClick(): void {
    this.onClose.emit();
  }
}
