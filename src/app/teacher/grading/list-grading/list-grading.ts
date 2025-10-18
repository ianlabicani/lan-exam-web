import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faClipboardList,
  faUserGraduate,
  faCheckCircle,
  faHourglassHalf,
  faSpinner,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import {
  GradingService,
  TakenExamForGrading,
} from '../../services/grading.service';

@Component({
  selector: 'app-grading-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FaIconComponent, DatePipe],
  template: `
    <div class="mx-auto max-w-6xl p-6 space-y-6">
      <!-- Header -->
      <div class="space-y-2">
        <a
          routerLink="/teacher/dashboard"
          class="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-3 font-medium"
        >
          <fa-icon [icon]="faArrowLeft" class="mr-2"></fa-icon>Back to Dashboard
        </a>
        <div class="flex items-center gap-3 mb-4">
          <fa-icon
            [icon]="faClipboardList"
            class="text-3xl text-indigo-600"
          ></fa-icon>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Grading</h1>
            <p class="text-gray-600">Review and grade student submissions</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
      <div class="flex justify-center items-center py-16">
        <fa-icon
          [icon]="faSpinner"
          class="text-4xl text-indigo-600 animate-spin"
        ></fa-icon>
        <span class="ml-3 text-lg text-gray-600">Loading submissions...</span>
      </div>
      } @else if (submissions().length === 0) {
      <!-- Empty State -->
      <div class="bg-white rounded-lg shadow-md p-12 text-center">
        <fa-icon
          [icon]="faCheckCircle"
          class="text-5xl text-green-500 mb-4 inline-block"
        ></fa-icon>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
        <p class="text-gray-600">All student submissions have been graded.</p>
      </div>
      } @else {
      <!-- Submissions Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  class="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Student
                </th>
                <th
                  class="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Exam
                </th>
                <th
                  class="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Submitted
                </th>
                <th
                  class="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Items
                </th>
                <th
                  class="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              @for (submission of submissions(); track submission.id) {
              <tr class="border-b border-gray-200 hover:bg-gray-50 transition">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
                    >
                      {{ submission.user.name.split(' ')[0].charAt(0)
                      }}{{ submission.user.name.split(' ')[1]?.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">
                        {{ submission.user.name }}
                      </p>
                      <p class="text-xs text-gray-600">
                        {{ submission.user.email }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <p class="font-medium text-gray-900">
                    {{ submission.exam.title }}
                  </p>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ submission.submitted_at | date : 'MMM dd, h:mm a' }}
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                  >
                    <fa-icon [icon]="faHourglassHalf" class="mr-1"></fa-icon
                    >Pending Review
                  </span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <span class="text-gray-700"
                    >{{ getPendingCount(submission) }} items</span
                  >
                </td>
                <td class="px-6 py-4">
                  <a
                    [routerLink]="['/teacher/grading', submission.id]"
                    class="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                  >
                    Grade →
                  </a>
                </td>
              </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      }
    </div>
  `,
  styles: ``,
})
export class GradingList implements OnInit {
  private gradingService = inject(GradingService);
  private router = inject(Router);

  // Icons
  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faClipboardList = faClipboardList;
  protected readonly faUserGraduate = faUserGraduate;
  protected readonly faCheckCircle = faCheckCircle;
  protected readonly faHourglassHalf = faHourglassHalf;
  protected readonly faSpinner = faSpinner;
  protected readonly faExclamationCircle = faExclamationCircle;

  // State
  protected submissions = signal<TakenExamForGrading[]>([]);
  protected isLoading = signal(true);

  ngOnInit(): void {
    this.loadSubmissions();
  }

  private loadSubmissions(): void {
    this.isLoading.set(true);
    this.gradingService.getPendingSubmissions().subscribe({
      next: (response) => {
        this.submissions.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load submissions:', err);
        this.isLoading.set(false);
      },
    });
  }

  protected getPendingCount(submission: TakenExamForGrading): number {
    return submission.answers.filter((ans) => ans.points_earned === null)
      .length;
  }
}
