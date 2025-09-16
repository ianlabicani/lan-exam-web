import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { DatePipe, NgClass, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../services/exam.service';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-view-exam',
  imports: [RouterLink, DatePipe, UpperCasePipe, FormsModule, RouterOutlet, FaIconComponent, NgClass],
  templateUrl: './view-exam.html',
  styleUrl: './view-exam.css',
})
export class ViewExam implements OnInit {
  examService = inject(ExamService);
  route = inject(ActivatedRoute);

  loadingSig = signal(true);
  errorMsg = signal<string | null>(null);

  faArrowLeft = faArrowLeft;

  ngOnInit(): void {
    const examId: number = this.route.snapshot.params['examId'];
    this.getExam(examId);
  }

  updateStatus(
    examId: number,
    status: 'active' | 'published' | 'archived' | 'draft'
  ) {
    const viewingExam = this.examService.viewingExam();
    if ((viewingExam?.total_points ?? 0) <= 0) {
      this.errorMsg.set('Exam must have at least one item to be activated.');
      setTimeout(() => {
        this.errorMsg.set(null);
      }, 3000);
      return;
    }

    this.examService.updateStatus(examId, status).subscribe({
      next: (exam) => {
        this.examService.viewingExam.set(exam);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to activate exam');
      },
    });
  }

  getExam(id: number) {
    this.loadingSig.set(true);
    this.examService.show(id).subscribe({
      next: (exam) => {
        this.loadingSig.set(false);
        this.examService.viewingExam.set(exam);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to load exam');
        this.loadingSig.set(false);
      },
    });
  }

  statusBadge(status?: string) {
    const map: Record<string, string> = {
      active: 'bg-blue-100 text-blue-700',
      published: 'bg-green-100 text-green-700',
      draft: 'bg-gray-100 text-gray-700',
      archived: 'bg-yellow-100 text-yellow-700',
    };
    return status
      ? map[status] || 'bg-gray-100 text-gray-700'
      : 'bg-gray-100 text-gray-700';
  }
}
