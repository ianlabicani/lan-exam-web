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
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ListExamsService } from './list-exams.service';
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
  listExamsSvc = inject(ListExamsService);

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

  ngOnInit(): void {
    this.listExamsSvc.loadExams();
  }

  // ========== DELEGATED TO SERVICE ==========
  onStatusFilterChange(status: 'all' | 'published' | 'draft' | 'archived') {
    this.listExamsSvc.setStatusFilter(status);
  }

  onSearch() {
    this.listExamsSvc.setSearchQuery(this.listExamsSvc.searchQuery());
    this.listExamsSvc.loadExams();
  }

  clearSearch() {
    this.listExamsSvc.clearSearch();
  }

  onAdvancedFilterChange() {
    this.listExamsSvc.setAdvancedFilters({
      yearFilter: this.listExamsSvc.yearFilter(),
      sectionFilter: this.listExamsSvc.sectionFilter(),
      dateFromFilter: this.listExamsSvc.dateFromFilter(),
    });
  }

  clearFilters() {
    this.listExamsSvc.clearFilters();
  }

  deleteExam(examId: number) {
    if (confirm('Are you sure you want to delete this exam?')) {
      this.listExamsSvc.deleteExam(examId).catch((err) => {
        alert(err || 'Failed to delete exam');
      });
    }
  }

  goToPage(page: number) {
    this.listExamsSvc.goToPage(page);
  }

  nextPage() {
    this.listExamsSvc.nextPage();
  }

  prevPage() {
    this.listExamsSvc.prevPage();
  }

  toggleAdvanced() {
    this.listExamsSvc.toggleAdvanced();
  }

  // ========== EXPOSE SERVICE STATE TO TEMPLATE ==========
  exams = this.listExamsSvc.exams;
  filteredExams = this.listExamsSvc.filteredExams;
  loading = this.listExamsSvc.loading;
  error = this.listExamsSvc.error;
  statusFilter = this.listExamsSvc.statusFilter;
  searchQuery = this.listExamsSvc.searchQuery;
  showAdvanced = this.listExamsSvc.showAdvanced;
  yearFilter = this.listExamsSvc.yearFilter;
  sectionFilter = this.listExamsSvc.sectionFilter;
  dateFromFilter = this.listExamsSvc.dateFromFilter;
  currentPage = this.listExamsSvc.currentPage;
  pageSize = this.listExamsSvc.pageSize;
  totalExams = this.listExamsSvc.totalExams;
  totalPages = this.listExamsSvc.totalPages;
  startIndex = this.listExamsSvc.startIndex;
  endIndex = this.listExamsSvc.endIndex;
  pageNumbers = this.listExamsSvc.pageNumbers;
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

  // Additional properties for duration in minutes and display
  durationInMins?: number;
  durationDisplay?: string;
}
