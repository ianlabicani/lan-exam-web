import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  faPlus,
  faChartLine,
  faCheckCircle,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ExamApiService } from '../services/exam-api.service';

@Component({
  selector: 'app-teacher-dashboard',
  imports: [DatePipe, RouterLink, FontAwesomeModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  protected examApi = inject(ExamApiService);

  // FontAwesome icons
  protected readonly faPlus = faPlus;
  protected readonly faChartLine = faChartLine;
  protected readonly faCheckCircle = faCheckCircle;
  protected readonly faClock = faClock;

  // Signals
  protected exams = signal<any[]>([]);
  protected recentActivity = signal<any[]>([]);
  protected isLoading = signal(true);
  protected error = signal<string | null>(null);

  // Computed stats
  protected totalExams = computed(() => this.exams().length);
  protected activeExams = computed(
    () => this.exams().filter((e) => e.status === 'active').length
  );
  protected publishedExams = computed(
    () => this.exams().filter((e) => e.status === 'published').length
  );
  protected draftExams = computed(
    () => this.exams().filter((e) => e.status === 'draft').length
  );
  protected completionRate = computed(() => {
    const publishedOrActive = this.exams().filter((e) =>
      ['active', 'published', 'archived'].includes(e.status)
    );
    if (!publishedOrActive.length) return 0;
    const ratios = publishedOrActive.map(
      (e) => (e.submissions || 0) / (e.totalStudents || 1)
    );
    return Math.round(
      (ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100
    );
  });

  ngOnInit(): void {
    this.loadExams();
  }

  protected loadExams(): void {
    this.isLoading.set(true);
    this.examApi.index().subscribe({
      next: (res: any) => {
        // ExamApiService returns { data: Exam[], meta?: {...} }
        const exams = res.data || [];
        // Transform API data if needed
        const transformedExams = exams.map((exam: any) => ({
          ...exam,
          submissions: Math.floor(Math.random() * exam.totalStudents || 0), // Mock data
          totalStudents: exam.totalStudents || 30,
          startsAt: exam.starts_at,
          endsAt: exam.ends_at,
        }));
        this.exams.set(transformedExams);
        this.generateMockActivity(transformedExams);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.error.set('Failed to load exams');
        this.isLoading.set(false);
        console.error('Error loading exams:', err);
      },
    });
  }

  protected generateMockActivity(exams: any[]): void {
    if (exams.length === 0) {
      this.recentActivity.set([]);
      return;
    }

    const activities = [
      {
        id: 'a1',
        type: 'submission',
        exam: exams[0]?.title || 'Exam',
        student: 'Alice B.',
        time: new Date(Date.now() - 15 * 60_000),
      },
      {
        id: 'a2',
        type: 'published',
        exam: exams[1]?.title || 'Exam',
        student: null,
        time: new Date(Date.now() - 2 * 3600_000),
      },
      {
        id: 'a3',
        type: 'graded',
        exam: exams[0]?.title || 'Exam',
        student: 'Emily R.',
        time: new Date(Date.now() - 5 * 3600_000),
      },
    ];
    this.recentActivity.set(activities);
  }

  protected statusBadge(status: string): string {
    const map: Record<string, string> = {
      active: 'bg-blue-100 text-blue-700',
      published: 'bg-green-100 text-green-700',
      draft: 'bg-gray-100 text-gray-700',
      archived: 'bg-yellow-100 text-yellow-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  }

  protected activityIcon(type: string): {
    color: string;
    bg: string;
    icon: string;
  } {
    switch (type) {
      case 'submission':
        return {
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          icon: 'M9 12h6m-6 4h6M5 8h14',
        };
      case 'published':
        return {
          color: 'text-green-600',
          bg: 'bg-green-50',
          icon: 'M5 13l4 4L19 7',
        };
      case 'graded':
        return {
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          icon: 'M9 17v-6h6v6m2 4H7',
        };
      default:
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          icon: 'M4 6h16M4 12h16M4 18h16',
        };
    }
  }

  protected progressPercent(exam: any): number {
    if (!exam.totalStudents) return 0;
    return Math.round(((exam.submissions || 0) / exam.totalStudents) * 100);
  }
}
