import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ExamService } from '../../services/exam.service';
import { Exam } from '../../models/exam';
import {
  faFileAlt,
  faPlayCircle,
  faClipboard,
  faHourglassHalf,
  faEdit,
  faArchive,
  faSpinner,
  faInfoCircle,
  faGraduationCap,
  faClock,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-list-exams',
  imports: [RouterLink, DatePipe, TitleCasePipe, NgClass, FaIconComponent],
  templateUrl: './list-exams.html',
  styleUrl: './list-exams.css',
})
export class ListExams implements OnInit {
  router = inject(Router);
  http = inject(HttpClient);
  examSvc = inject(ExamService);

  fasFileAlt = faFileAlt;
  fasPlayCircle = faPlayCircle;
  fasClipboard = faClipboard;
  faHourglassHalf = faHourglassHalf;
  fasEdit = faEdit;
  fasArchive = faArchive;
  faSpinner = faSpinner;
  fasInfoCircle = faInfoCircle;
  fasGraduationCap = faGraduationCap;
  fasClock = faClock;
  fasTag = faTag;

  exams = signal<Exam[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.getExams();
  }

  getExams() {
    this.isLoading.set(true);
    this.examSvc.getAll().subscribe({
      next: (res) => {
        this.exams.set(res.data);
        this.isLoading.set(false);
      },
    });
  }

  takeExam(examId: number) {
    this.examSvc.takeExam(examId).subscribe({
      next: (res) => {
        this.router.navigate(['/student/taken-exams', res.data.id, 'continue']);
      },
    });
  }
}
