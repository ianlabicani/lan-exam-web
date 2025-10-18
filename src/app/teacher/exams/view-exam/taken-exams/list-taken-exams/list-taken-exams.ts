import { DatePipe, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faFilter,
  faChartLine,
  faTrophy,
  faExclamationTriangle,
  faQuestionCircle,
  faCheckCircle,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-list-taken-exams',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule, FontAwesomeModule],
  templateUrl: './list-taken-exams.html',
  styleUrl: './list-taken-exams.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListTakenExams implements OnInit {
  examId = signal<number>(0);
  loading = signal(true);
  exam = signal<any | null>(null);
  takers = signal<ITakenExam[]>([]);
  analytics = signal<any | null>(null);
  searchTerm = signal<string>('');
  filterStatus = signal<string>('all');
  sortBy = signal<string>('recent');

  http = inject(HttpClient);
  activatedRoute = inject(ActivatedRoute);

  // FontAwesome icons
  faSearch = faSearch;
  faFilter = faFilter;
  faChartLine = faChartLine;
  faTrophy = faTrophy;
  faExclamationTriangle = faExclamationTriangle;
  faQuestionCircle = faQuestionCircle;
  faCheckCircle = faCheckCircle;
  faUsers = faUsers;

  // Computed filtered and sorted takers
  filteredTakers = computed(() => {
    let filtered = this.takers();
    const search = this.searchTerm().toLowerCase();
    const status = this.filterStatus();

    // Filter by search term
    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.user.name.toLowerCase().includes(search) ||
          t.user.email.toLowerCase().includes(search)
      );
    }

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter((t) => {
        if (status === 'ongoing') return !t.submitted_at;
        if (status === 'submitted') return t.submitted_at && !t.is_graded;
        if (status === 'graded') return t.is_graded;
        return true;
      });
    }

    // Sort
    const sort = this.sortBy();
    filtered.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.user.name.localeCompare(b.user.name);
        case 'score-high':
          return (b.total_points || 0) - (a.total_points || 0);
        case 'score-low':
          return (a.total_points || 0) - (b.total_points || 0);
        case 'recent':
        default:
          return (
            new Date(b.submitted_at || b.started_at).getTime() -
            new Date(a.submitted_at || a.started_at).getTime()
          );
      }
    });

    return filtered;
  });

  ngOnInit(): void {
    this.examId.set(
      +this.activatedRoute.parent?.snapshot.paramMap.get('examId')!
    );
    this.loadData();
  }

  loadData(): void {
    this.http
      .get<{ data: { takenExams: ITakenExam[]; analytics: any } }>(
        `http://127.0.0.1:8000/api/teacher/exams/${this.examId()}/taken-exams`
      )
      .subscribe({
        next: (res) => {
          this.takers.set(res.data?.takenExams || []);
          this.analytics.set(res.data?.analytics || null);
          this.loading.set(false);
        },
        error: () => {
          this.takers.set([]);
          this.analytics.set(null);
          this.loading.set(false);
        },
      });
  }

  getExamTitle(): string {
    // Try to get from service or parent
    return 'Exam';
  }

  getStatusClass(taker: ITakenExam): string {
    if (!taker.submitted_at) return 'bg-yellow-100 text-yellow-700';
    if (!taker.is_graded) return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  }

  getStatusText(taker: ITakenExam): string {
    if (!taker.submitted_at) return 'In Progress';
    if (!taker.is_graded) return 'Submitted';
    return 'Graded';
  }

  getScorePercentage(taker: ITakenExam): number {
    return this.exam()?.total_points
      ? Math.round((taker.total_points / this.exam().total_points) * 100)
      : 0;
  }
}

interface ITakenExam {
  id: number;
  exam_id: number;
  user_id: number;
  started_at: string | Date;
  submitted_at?: string | Date;
  total_points: number;
  is_graded?: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  user: User;
  score?: number;
  percentage?: number;
  status?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  year?: string;
  section?: string;
  email_verified_at?: null;
  created_at: string | Date;
  updated_at: string | Date;
}
