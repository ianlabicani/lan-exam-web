import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faChartBar,
  faClipboardList,
  faClock,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { ExamService } from '../../../services/exam.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent implements OnInit {
  private examService = inject(ExamService);
  private route = inject(ActivatedRoute);

  // Icons
  protected faChartBar = faChartBar;
  protected faClipboardList = faClipboardList;
  protected faClock = faClock;
  protected faCheckCircle = faCheckCircle;

  // State
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  // Analytics data
  protected analytics = signal<{
    totalAttempts: number;
    avgScore: number;
    completionRate: number;
    avgTimeOnExam: string;
    questionStats: Array<{
      questionId: number;
      question: string;
      totalAttempts: number;
      correctAttempts: number;
      percentCorrect: number;
    }>;
  } | null>(null);

  // Computed stats
  protected completionPercentage = computed(() => {
    const data = this.analytics();
    return data ? Math.round(data.completionRate * 100) : 0;
  });

  protected avgScoreDisplay = computed(() => {
    const data = this.analytics();
    return data ? data.avgScore.toFixed(2) : '0.00';
  });

  ngOnInit(): void {
    const examId = this.route.snapshot.params['examId'];
    if (examId) {
      this.loadAnalytics(examId);
    }
  }

  private loadAnalytics(examId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.examService.getExamAnalytics(examId).subscribe({
      next: () => {
        // For now, we'll use mock data structure until backend is ready
        const mockAnalytics = {
          totalAttempts: 24,
          avgScore: 78.5,
          completionRate: 0.92,
          avgTimeOnExam: '45 mins',
          questionStats: [
            {
              questionId: 1,
              question: 'What is the capital of France?',
              totalAttempts: 24,
              correctAttempts: 22,
              percentCorrect: 91.67,
            },
            {
              questionId: 2,
              question: 'Define photosynthesis',
              totalAttempts: 24,
              correctAttempts: 18,
              percentCorrect: 75.0,
            },
            {
              questionId: 3,
              question: 'Explain the water cycle',
              totalAttempts: 24,
              correctAttempts: 14,
              percentCorrect: 58.33,
            },
          ],
        };

        this.analytics.set(mockAnalytics);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(
          err?.error?.message || 'Failed to load analytics. Using sample data.'
        );
        // Set mock data even on error so UI displays something
        const mockAnalytics = {
          totalAttempts: 24,
          avgScore: 78.5,
          completionRate: 0.92,
          avgTimeOnExam: '45 mins',
          questionStats: [
            {
              questionId: 1,
              question: 'What is the capital of France?',
              totalAttempts: 24,
              correctAttempts: 22,
              percentCorrect: 91.67,
            },
            {
              questionId: 2,
              question: 'Define photosynthesis',
              totalAttempts: 24,
              correctAttempts: 18,
              percentCorrect: 75.0,
            },
            {
              questionId: 3,
              question: 'Explain the water cycle',
              totalAttempts: 24,
              correctAttempts: 14,
              percentCorrect: 58.33,
            },
          ],
        };
        this.analytics.set(mockAnalytics);
        this.loading.set(false);
      },
    });
  }
}
