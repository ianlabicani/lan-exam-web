import {
  CommonModule,
  DatePipe,
  NgClass,
  TitleCasePipe,
} from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
  effect,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { debounceTime, Subject } from 'rxjs';
import {
  faPlus,
  faEye,
  faEdit,
  faTrash,
  faSearch,
  faChevronDown,
  faChevronUp,
  faFilter,
  faTimes,
  faCheckCircle,
  faPencil,
  faArchive,
  faGraduationCap,
  faUsers,
  faCalendar,
  faCalendarCheck,
  faQuestion,
  faStar,
  faCalendarPlus,
  faFolderOpen,
  faList,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './list-exams.html',
  styleUrl: './list-exams.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListExams implements OnInit {
  http = inject(HttpClient);

  exams = signal<GetExamsData[]>([]);
  filteredExams = signal<GetExamsData[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  statusFilter = signal<'all' | 'published' | 'draft' | 'archived'>('all');
  searchQuery = signal('');
  showAdvanced = signal(false);
  yearFilter = signal('');
  sectionFilter = signal('');
  dateFromFilter = signal('');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalExams = signal(0);
  totalPages = signal(0);

  // Debounce search
  searchSubject = new Subject<string>();

  // FontAwesome icons
  faPlus = faPlus;
  faEye = faEye;
  faEdit = faEdit;
  faTrash = faTrash;
  faSearch = faSearch;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faFilter = faFilter;
  faTimes = faTimes;
  faCheckCircle = faCheckCircle;
  faPencil = faPencil;
  faArchive = faArchive;
  faGraduationCap = faGraduationCap;
  faUsers = faUsers;
  faCalendar = faCalendar;
  faCalendarCheck = faCalendarCheck;
  faQuestion = faQuestion;
  faStar = faStar;
  faCalendarPlus = faCalendarPlus;
  faFolderOpen = faFolderOpen;
  faList = faList;

  // Make Array available in template
  Array = Array;
  Number = Number;

  ngOnInit(): void {
    // Setup debounced search
    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.currentPage.set(1);
      this.loadExams();
    });

    this.loadExams();
  }

  loadExams() {
    this.loading.set(true);
    this.error.set(null);

    const params = this.buildQueryParams();
    this.getExams(params).subscribe({
      next: (res) => {
        const examsWithDuration = res.data.map((exam) => ({
          ...exam,
          durationInMins: this.calculateDuration(exam.starts_at, exam.ends_at),
          durationDisplay: this.formatDuration(exam.starts_at, exam.ends_at),
        }));

        this.exams.set(examsWithDuration);
        this.filteredExams.set(examsWithDuration);
        this.totalExams.set(res.meta?.total || examsWithDuration.length);
        this.totalPages.set(
          Math.ceil(
            (res.meta?.total || examsWithDuration.length) / this.pageSize()
          )
        );
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load exams');
        this.loading.set(false);
      },
    });
  }

  buildQueryParams(): Record<string, string | number> {
    const params: Record<string, string | number> = {
      page: this.currentPage(),
    };

    if (this.statusFilter() !== 'all') {
      params['status'] = this.statusFilter();
    }

    if (this.searchQuery()) {
      params['search'] = this.searchQuery();
    }

    if (this.yearFilter()) {
      params['year'] = this.yearFilter();
    }

    if (this.sectionFilter()) {
      params['section'] = this.sectionFilter();
    }

    if (this.dateFromFilter()) {
      params['date_from'] = this.dateFromFilter();
    }

    return params;
  }

  getExams(params?: Record<string, string | number>) {
    let url = `${environment.apiBaseUrl}/teacher/exams`;

    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryString.append(key, String(value));
      });
      url += `?${queryString.toString()}`;
    }

    return this.http.get<{
      data: GetExamsData[];
      meta?: { total: number; current_page: number; per_page: number };
    }>(url);
  }

  applyFilters() {
    let filtered = [...this.exams()];

    // Status filter
    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter((e) => e.status === this.statusFilter());
    }

    // Search filter
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          (e.description?.toLowerCase().includes(query) ?? false)
      );
    }

    // Year filter
    if (this.yearFilter()) {
      filtered = filtered.filter((e) =>
        Array.isArray(e.year)
          ? e.year.includes(this.yearFilter())
          : e.year === this.yearFilter()
      );
    }

    // Section filter
    if (this.sectionFilter()) {
      filtered = filtered.filter((e) =>
        Array.isArray(e.sections)
          ? e.sections.includes(this.sectionFilter())
          : false
      );
    }

    // Date filter
    if (this.dateFromFilter()) {
      const filterDate = new Date(this.dateFromFilter());
      filtered = filtered.filter((e) => new Date(e.starts_at) >= filterDate);
    }

    this.filteredExams.set(filtered);
  }

  onStatusFilterChange(status: 'all' | 'published' | 'draft' | 'archived') {
    this.statusFilter.set(status);
    this.currentPage.set(1);
    this.loadExams();
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadExams();
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadExams();
  }

  onAdvancedFilterChange() {
    this.currentPage.set(1);
    this.loadExams();
  }

  clearFilters() {
    this.statusFilter.set('all');
    this.searchQuery.set('');
    this.yearFilter.set('');
    this.sectionFilter.set('');
    this.dateFromFilter.set('');
    this.showAdvanced.set(false);
    this.currentPage.set(1);
    this.loadExams();
  }

  deleteExam(examId: number) {
    if (confirm('Are you sure you want to delete this exam?')) {
      this.http
        .delete(`${environment.apiBaseUrl}/teacher/exams/${examId}`)
        .subscribe({
          next: () => {
            this.loadExams();
          },
          error: (err) => {
            alert('Failed to delete exam');
          },
        });
    }
  }

  getStartIndex(): number {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalExams());
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadExams();
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadExams();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadExams();
    }
  }

  getPageNumbers(): (number | string)[] {
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  }

  calculateDuration(startsAt: Date | string, endsAt: Date | string): number {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / 60000); // Convert ms to minutes
  }

  formatDuration(startsAt: Date | string, endsAt: Date | string): string {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const diffMs = end.getTime() - start.getTime();
    const totalMinutes = Math.round(diffMs / 60000);

    if (totalMinutes < 60) {
      return `${totalMinutes} mins`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hours < 24) {
      return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    return `${days}d ${remainingHours}h`;
  }
}

interface GetExamsData {
  id: number;
  title: string;
  description: string;
  starts_at: Date;
  ends_at: Date;
  year: string | string[];
  sections: string[];
  status: string;
  total_points: number;
  created_at: Date;
  updated_at: Date;
  items?: any[]; // Array of exam items/questions

  // Additional properties for duration in minutes and display
  durationInMins?: number;
  durationDisplay?: string;
}
