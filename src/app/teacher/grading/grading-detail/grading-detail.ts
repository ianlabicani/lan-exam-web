import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faSave,
  faCheckCircle,
  faSpinner,
  faExclamationCircle,
  faClipboardCheck,
  faUser,
  faBook,
  faChartBar,
} from '@fortawesome/free-solid-svg-icons';
import { GradingService, GradingDetail } from '../../services/grading.service';

@Component({
  selector: 'app-grading-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FaIconComponent, DatePipe, FormsModule],
  template: `
    <div class="mx-auto max-w-6xl p-6 space-y-6">
      <!-- Header -->
      <a
        routerLink="/teacher/grading"
        class="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-3 font-medium"
      >
        <fa-icon [icon]="faArrowLeft" class="mr-2"></fa-icon>Back to Submissions
      </a>

      <!-- Loading State -->
      @if (isLoading()) {
      <div class="flex justify-center items-center py-16">
        <fa-icon
          [icon]="faSpinner"
          class="text-4xl text-indigo-600 animate-spin"
        ></fa-icon>
      </div>
      } @else if (detail()) { @let data = detail()!;
      <div class="space-y-6">
        <!-- Student Info Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">
                {{ data.student.name }}
              </h1>
              <p class="text-gray-600">{{ data.student.email }}</p>
              <p class="text-sm text-gray-600 mt-2">
                <fa-icon [icon]="faUser" class="mr-1"></fa-icon
                >{{ data.student.year }} - {{ data.student.section }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Exam</p>
              <p class="text-xl font-bold text-gray-900">
                {{ data.exam.title }}
              </p>
              <p class="text-sm text-gray-600 mt-2">
                Submitted:
                {{ data.takenExam.submitted_at | date : 'MMM dd, h:mm a' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Progress Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2
            class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"
          >
            <fa-icon [icon]="faChartBar"></fa-icon>Grading Progress
          </h2>
          <div class="grid md:grid-cols-4 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Total Items</p>
              <p class="text-2xl font-bold text-blue-600">
                {{ data.totalItems }}
              </p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Auto-Graded</p>
              <p class="text-2xl font-bold text-green-600">
                {{ data.autoGradedItems }}
              </p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Manual Graded</p>
              <p class="text-2xl font-bold text-purple-600">
                {{ data.manualGradedItems }}
              </p>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Pending</p>
              <p class="text-2xl font-bold text-yellow-600">
                {{ data.pendingGradingItems }}
              </p>
            </div>
          </div>

          <!-- Score Summary -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-3">Score Summary</h3>
            <div class="grid md:grid-cols-3 gap-4">
              <div class="border border-gray-200 p-4 rounded-lg">
                <p class="text-sm text-gray-600">Auto-Graded Score</p>
                <p class="text-xl font-bold text-gray-900">
                  {{ data.autoGradedScore }} pts
                </p>
              </div>
              <div class="border border-gray-200 p-4 rounded-lg">
                <p class="text-sm text-gray-600">Manual Graded Score</p>
                <p class="text-xl font-bold text-gray-900">
                  {{ data.manualGradedScore }} pts
                </p>
              </div>
              <div
                class="border-2 border-indigo-600 bg-indigo-50 p-4 rounded-lg"
              >
                <p class="text-sm text-indigo-600 font-semibold">Total Score</p>
                <p class="text-2xl font-bold text-indigo-600">
                  {{ data.takenExam.total_points }} /
                  {{ data.exam.total_points }} pts
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Grading Items -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2
            class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"
          >
            <fa-icon [icon]="faBook"></fa-icon>Items Needing Grading
          </h2>

          @if (data.itemsNeedingGrading.length === 0) {
          <div class="text-center py-8">
            <fa-icon
              [icon]="faCheckCircle"
              class="text-4xl text-green-500 mb-3 inline-block"
            ></fa-icon>
            <p class="text-gray-600">All items have been graded!</p>
            <button
              (click)="finalizeGrading()"
              [disabled]="isFinalizing()"
              class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {{ isFinalizing() ? 'Finalizing...' : 'Finalize Grading' }}
            </button>
          </div>
          } @else {
          <div class="space-y-6">
            @for (item of data.itemsNeedingGrading; track item.id) {
            <div class="border border-gray-200 rounded-lg p-6">
              <div class="mb-4">
                <h3 class="text-base font-semibold text-gray-900">
                  {{ item.question }}
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  Points: {{ item.item.points }}
                </p>
              </div>

              <!-- Student Answer -->
              <div class="bg-gray-50 p-4 rounded-lg mb-4">
                <p class="text-xs font-semibold text-gray-600 mb-2">
                  STUDENT ANSWER
                </p>
                <p class="text-gray-900">
                  {{ item.answer || '(No answer provided)' }}
                </p>
              </div>

              <!-- Grading Form -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Score (0 - {{ item.item.points }})
                  </label>
                  <input
                    type="number"
                    [(ngModel)]="item.points_earned"
                    min="0"
                    [max]="item.item.points"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-2"
                    >Feedback (Optional)</label
                  >
                  <textarea
                    [(ngModel)]="item.feedback"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Provide feedback to the student..."
                  ></textarea>
                </div>

                <button
                  (click)="saveScore(item)"
                  [disabled]="isSaving()"
                  class="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <fa-icon [icon]="faSave"></fa-icon
                  >{{ isSaving() ? 'Saving...' : 'Save Score' }}
                </button>
              </div>
            </div>
            }

            <!-- Finalize Button -->
            <div
              class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200"
            >
              <button
                (click)="finalizeGrading()"
                [disabled]="isFinalizing() || data.pendingGradingItems > 0"
                class="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <fa-icon [icon]="faCheckCircle"></fa-icon
                >{{ isFinalizing() ? 'Finalizing...' : 'Finalize Grading' }}
              </button>
            </div>
          </div>
          }
        </div>
      </div>
      }
    </div>
  `,
  styles: ``,
})
export class GradingDetailComponent implements OnInit {
  private gradingService = inject(GradingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Icons
  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faSave = faSave;
  protected readonly faCheckCircle = faCheckCircle;
  protected readonly faSpinner = faSpinner;
  protected readonly faExclamationCircle = faExclamationCircle;
  protected readonly faClipboardCheck = faClipboardCheck;
  protected readonly faUser = faUser;
  protected readonly faBook = faBook;
  protected readonly faChartBar = faChartBar;

  // State
  protected detail = signal<GradingDetail | null>(null);
  protected isLoading = signal(true);
  protected isSaving = signal(false);
  protected isFinalizing = signal(false);

  ngOnInit(): void {
    const takenExamId = this.route.snapshot.params['takenExamId'];
    this.loadGradingDetail(takenExamId);
  }

  private loadGradingDetail(takenExamId: number): void {
    this.isLoading.set(true);
    this.gradingService.getGradingDetail(takenExamId).subscribe({
      next: (response) => {
        this.detail.set(response);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load grading detail:', err);
        this.isLoading.set(false);
      },
    });
  }

  protected saveScore(item: any): void {
    const takenExamId = this.route.snapshot.params['takenExamId'];
    this.isSaving.set(true);

    this.gradingService
      .updateScore(takenExamId, item.exam_item_id, {
        teacher_score: item.points_earned,
        feedback: item.feedback,
      })
      .subscribe({
        next: (response) => {
          console.log('Score saved:', response);
          this.isSaving.set(false);
          // Reload the detail to update pending count
          this.loadGradingDetail(takenExamId);
        },
        error: (err) => {
          console.error('Failed to save score:', err);
          this.isSaving.set(false);
        },
      });
  }

  protected finalizeGrading(): void {
    const takenExamId = this.route.snapshot.params['takenExamId'];
    this.isFinalizing.set(true);

    this.gradingService.finalizeGrade(takenExamId).subscribe({
      next: (response) => {
        console.log('Grading finalized:', response);
        this.isFinalizing.set(false);
        // Navigate back to list
        this.router.navigate(['/teacher/grading']);
      },
      error: (err) => {
        console.error('Failed to finalize grading:', err);
        this.isFinalizing.set(false);
      },
    });
  }
}
