import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { DatePipe, NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  faArrowLeft,
  faCheckCircle,
  faExclamationCircle,
  faTimes,
  faSync,
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ViewExamService } from './view-exam.service';

@Component({
  selector: 'app-view-exam',
  imports: [
    RouterLink,
    DatePipe,
    FormsModule,
    RouterOutlet,
    FaIconComponent,
    NgClass,
    CommonModule,
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
  activeTab = signal<'overview' | 'items' | 'grading' | 'analytics'>(
    'overview'
  );
  showStatusModal = signal(false);
  selectedStatus = signal<string | null>(null);

  faArrowLeft = faArrowLeft;
  faCheckCircle = faCheckCircle;
  faExclamationCircle = faExclamationCircle;
  faTimes = faTimes;
  faSync = faSync;

  // Computed signals
  exam = this.viewExamSvc.exam;
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

  submitStatusUpdate(examId: number) {
    const status = this.selectedStatus();
    if (!status) return;

    const exam = this.exam();
    if ((exam?.total_points ?? 0) <= 0 && status === 'active') {
      this.errorMsg.set('Exam must have at least one item to be activated.');
      setTimeout(() => {
        this.errorMsg.set(null);
      }, 3000);
      return;
    }

    this.saving.set(true);
    this.viewExamSvc.updateStatus(examId, status as any).subscribe({
      next: (exam) => {
        this.viewExamSvc.exam.set(exam);
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
      next: (exam) => {
        this.viewExamSvc.exam.set(exam);
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
        this.viewExamSvc.exam.set(res.data.exam);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to load exam');
        this.loading.set(false);
      },
    });
  }
}
