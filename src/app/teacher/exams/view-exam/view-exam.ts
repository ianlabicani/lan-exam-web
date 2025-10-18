import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import {
  RouterLink,
  RouterOutlet,
  ActivatedRoute,
  RouterLinkActive,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  faArrowLeft,
  faCheckCircle,
  faExclamationCircle,
  faTimes,
  faSync,
  faInfoCircle,
  faGraduationCap,
  faUsers,
  faCalendar,
  faCalendarTimes,
  faClock,
  faStar,
  faTable,
  faBookOpen,
  faSignal,
  faListOl,
  faCog,
  faCheck,
  faDatabase,
  faQuestionCircle,
  faChartLine,
  faPencilAlt,
  faClipboardCheck,
  faHourglassHalf,
  faLock,
  faArchive,
  faEdit,
  faTrash,
  faChalkboardUser,
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ViewExamService } from './view-exam.service';
import { StatusUpdateModalComponent } from './status-update-modal/status-update-modal';

@Component({
  selector: 'app-view-exam',
  imports: [
    RouterLink,
    RouterLinkActive,
    FormsModule,
    RouterOutlet,
    FaIconComponent,
    CommonModule,
    StatusUpdateModalComponent,
  ],
  templateUrl: './view-exam.html',
  styleUrl: './view-exam.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewExam implements OnInit {
  viewExamSvc = inject(ViewExamService);
  route = inject(ActivatedRoute);

  loading = signal(true);
  saving = signal(false);
  errorMsg = signal<string | null>(null);
  activeTab = signal<'overview' | 'items' | 'takers' | 'analytics'>('overview');
  showStatusModal = signal(false);
  selectedStatus = signal<string | null>(null);

  faArrowLeft = faArrowLeft;
  faCheckCircle = faCheckCircle;
  faExclamationCircle = faExclamationCircle;
  faTimes = faTimes;
  faSync = faSync;
  faInfoCircle = faInfoCircle;
  faGraduationCap = faGraduationCap;
  faUsers = faUsers;
  faCalendar = faCalendar;
  faCalendarTimes = faCalendarTimes;
  faClock = faClock;
  faStar = faStar;
  faTable = faTable;
  faBookOpen = faBookOpen;
  faSignal = faSignal;
  faListOl = faListOl;
  faCog = faCog;
  faCheck = faCheck;
  faDatabase = faDatabase;
  faQuestionCircle = faQuestionCircle;
  faChartLine = faChartLine;
  faPencilAlt = faPencilAlt;
  faClipboardCheck = faClipboardCheck;
  faHourglassHalf = faHourglassHalf;
  faLock = faLock;
  faArchive = faArchive;
  faEdit = faEdit;
  faTrash = faTrash;
  faChalkboardUser = faChalkboardUser;

  // Computed signals
  exam = this.viewExamSvc.viewingExam;
  statusBadgeClass = computed(() => {
    const exam = this.exam();
    if (!exam) return 'bg-gray-100 text-gray-700';
    switch (exam.status) {
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'archived':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  });

  // Stats computed signals
  totalQuestions = computed(() => {
    const exam = this.exam();
    return exam?.items?.length ?? 0;
  });

  totalTakers = computed(() => {
    const exam = this.exam();
    // TODO: Calculate from taken_exams when available
    return 0;
  });

  completedCount = computed(() => {
    const exam = this.exam();
    // TODO: Calculate from taken_exams when available
    return 0;
  });

  averageScore = computed(() => {
    const exam = this.exam();
    // TODO: Calculate from taken_exams when available
    return 0;
  });

  showTabs = signal(true);

  ngOnInit(): void {
    const examId: number = this.route.snapshot.params['examId'];
    this.getExam(examId);
  }

  openStatusModal() {
    this.showStatusModal.set(true);
  }

  closeStatusModal() {
    this.showStatusModal.set(false);
    this.selectedStatus.set(null);
  }

  submitStatusUpdate(statusToUpdate: string): void {
    const examId = this.exam()?.id;
    if (!examId || !statusToUpdate) return;

    const exam = this.exam();
    if ((exam?.total_points ?? 0) <= 0 && statusToUpdate === 'active') {
      this.errorMsg.set('Exam must have at least one item to be activated.');
      setTimeout(() => {
        this.errorMsg.set(null);
      }, 3000);
      return;
    }

    this.saving.set(true);
    this.viewExamSvc.updateStatus(examId, statusToUpdate as any).subscribe({
      next: () => {
        // Service already updates the state via tap()
        this.saving.set(false);
        this.closeStatusModal();
      },
      error: (err) => {
        this.errorMsg.set(
          err?.error?.message || 'Failed to update exam status'
        );
        this.saving.set(false);
      },
    });
  }

  updateStatus(
    examId: number,
    status: 'active' | 'published' | 'archived' | 'draft'
  ) {
    const exam = this.exam();
    if ((exam?.total_points ?? 0) <= 0 && status === 'active') {
      this.errorMsg.set('Exam must have at least one item to be activated.');
      setTimeout(() => {
        this.errorMsg.set(null);
      }, 3000);
      return;
    }

    this.saving.set(true);
    this.viewExamSvc.updateStatus(examId, status).subscribe({
      next: () => {
        // Service already updates the state via tap()
        this.saving.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to activate exam');
        this.saving.set(false);
      },
    });
  }

  getExam(id: number) {
    this.loading.set(true);
    this.viewExamSvc.show(id).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.viewExamSvc.setCurrentViewingExam(res.data.exam);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to load exam');
        this.loading.set(false);
      },
    });
  }

  calculateDuration(startDate: Date | string, endDate: Date | string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.round((end.getTime() - start.getTime()) / 60000); // Convert ms to minutes
  }

  confirmDelete(examId: number): void {
    const confirmed = confirm('Are you sure you want to delete this exam?');
    if (confirmed) {
      // TODO: Implement delete exam method in service
      console.log('Deleting exam:', examId);
    }
  }
}
