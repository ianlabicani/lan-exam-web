import { Injectable, inject, signal, computed } from '@angular/core';
import { ExamApiService } from '../../services/exam-api.service';
import { Exam } from '../../services/exam.service';

export interface GetExamsData extends Exam {
  durationInMins?: number;
  durationDisplay?: string;
}

/**
 * ListExamsService manages state and logic for the exams list feature.
 * Handles pagination, filtering, searching, and data transformation.
 */
@Injectable({
  providedIn: 'root',
})
export class ListExamsService {
  private api = inject(ExamApiService);

  // ========== STATE SIGNALS ==========
  exams = signal<GetExamsData[]>([]);
  filteredExams = signal<GetExamsData[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Filters
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
  totalPages = computed(() =>
    Math.ceil((this.totalExams() || this.exams().length) / this.pageSize())
  );

  // ========== COMPUTED PROPERTIES ==========
  startIndex = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);

  endIndex = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalExams())
  );

  pageNumbers = computed(() => this.calculatePageNumbers());

  // ========== PUBLIC METHODS ==========

  /**
   * Load exams from API with current filters and pagination.
   */
  loadExams(): void {
    this.loading.set(true);
    this.error.set(null);

    const params = this.buildQueryParams();
    this.api.index(params).subscribe({
      next: (res) => {
        const examsWithDuration = res.data.map((exam) => ({
          ...exam,
          durationInMins: this.calculateDuration(exam.starts_at, exam.ends_at),
          durationDisplay: this.formatDuration(exam.starts_at, exam.ends_at),
        }));

        this.exams.set(examsWithDuration);
        this.filteredExams.set(examsWithDuration);
        this.totalExams.set(res.meta?.total || examsWithDuration.length);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.error?.message || 'Failed to load exams');
        this.loading.set(false);
      },
    });
  }

  /**
   * Change status filter and reload.
   */
  setStatusFilter(status: 'all' | 'published' | 'draft' | 'archived'): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
    this.loadExams();
  }

  /**
   * Update search query and reload.
   */
  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.loadExams();
  }

  /**
   * Clear search and reload.
   */
  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadExams();
  }

  /**
   * Update advanced filters (year, section, date).
   */
  setAdvancedFilters(filters: {
    yearFilter?: string;
    sectionFilter?: string;
    dateFromFilter?: string;
  }): void {
    if (filters.yearFilter !== undefined)
      this.yearFilter.set(filters.yearFilter);
    if (filters.sectionFilter !== undefined)
      this.sectionFilter.set(filters.sectionFilter);
    if (filters.dateFromFilter !== undefined)
      this.dateFromFilter.set(filters.dateFromFilter);
    this.currentPage.set(1);
    this.loadExams();
  }

  /**
   * Clear all filters and reload.
   */
  clearFilters(): void {
    this.statusFilter.set('all');
    this.searchQuery.set('');
    this.yearFilter.set('');
    this.sectionFilter.set('');
    this.dateFromFilter.set('');
    this.showAdvanced.set(false);
    this.currentPage.set(1);
    this.loadExams();
  }

  /**
   * Navigate to a specific page.
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadExams();
    }
  }

  /**
   * Go to next page.
   */
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadExams();
    }
  }

  /**
   * Go to previous page.
   */
  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadExams();
    }
  }

  /**
   * Delete an exam by ID.
   */
  deleteExam(examId: number | string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.api.destroy(examId).subscribe({
        next: () => {
          this.loadExams();
          resolve();
        },
        error: (err: any) => {
          reject(err?.error?.message || 'Failed to delete exam');
        },
      });
    });
  }

  /**
   * Toggle advanced filter visibility.
   */
  toggleAdvanced(): void {
    this.showAdvanced.update((v) => !v);
  }

  // ========== PRIVATE HELPER METHODS ==========

  private buildQueryParams(): Record<string, string | number> {
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

  private calculateDuration(
    startsAt: Date | string,
    endsAt: Date | string
  ): number {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / 60000); // Convert ms to minutes
  }

  private formatDuration(
    startsAt: Date | string,
    endsAt: Date | string
  ): string {
    const totalMinutes = this.calculateDuration(startsAt, endsAt);

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

  private calculatePageNumbers(): (number | string)[] {
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
}
