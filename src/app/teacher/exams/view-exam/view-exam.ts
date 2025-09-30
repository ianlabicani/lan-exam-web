import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
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
  ],
  templateUrl: './view-exam.html',
  styleUrl: './view-exam.css',
})
export class ViewExam implements OnInit {
  viewExamSvc = inject(ViewExamService);
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
    const viewingExam = this.viewExamSvc.exam();
    if ((viewingExam?.total_points ?? 0) <= 0) {
      this.errorMsg.set('Exam must have at least one item to be activated.');
      setTimeout(() => {
        this.errorMsg.set(null);
      }, 3000);
      return;
    }

    this.viewExamSvc.updateStatus(examId, status).subscribe({
      next: (exam) => {
        this.viewExamSvc.exam.set(exam);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to activate exam');
      },
    });
  }

  getExam(id: number) {
    this.loadingSig.set(true);
    this.viewExamSvc.show(id).subscribe({
      next: (res) => {
        this.loadingSig.set(false);
        this.viewExamSvc.exam.set(res.data);
        console.log('exam', res);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to load exam');
        this.loadingSig.set(false);
      },
    });
  }
}
