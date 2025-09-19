import { StudentTakenExamService } from './../../services/student-taken-exam.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ITakenExam,
  StudentExamService,
} from '../../services/student-exam.service';
import { Exam } from '../../../teacher/services/exam.service';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-list-exams',
  imports: [RouterLink, DatePipe, TitleCasePipe, NgClass],
  templateUrl: './list-exams.html',
  styleUrl: './list-exams.css',
})
export class ListExams implements OnInit {
  studentExamService = inject(StudentExamService);
  studentTakenExamService = inject(StudentTakenExamService);
  router = inject(Router);

  exams = signal<(Exam & { taken_exams: ITakenExam[] })[]>([]);

  ngOnInit(): void {
    this.studentExamService.getAll().subscribe({
      next: (res) => {
        this.exams.set(res.data as (Exam & { taken_exams: ITakenExam[] })[]);
      },
      error: (error) => console.error('Error fetching exams:', error),
    });
  }

  takeExam(examId: number) {
    this.studentTakenExamService.create(examId).subscribe({
      next: (res) => {
        console.log('Taken exam created:', res);
        this.router.navigate(['/student/take-exam', examId]);
      },
    });
  }

  goTo(exam: Exam) {
    if (exam.status !== 'active') return;
    this.router.navigate(['/student/taken-exams', exam.id]);
  }

  cardIcon(exam: Exam): { bg: string; icon: string; color: string } {
    switch (exam.status) {
      case 'published':
      case 'active':
        return {
          bg: 'bg-blue-100',
          icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
          color: 'text-blue-600',
        };
      case 'archived':
        return {
          bg: 'bg-yellow-100',
          icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
          color: 'text-yellow-600',
        };
      case 'draft':
      default:
        return {
          bg: 'bg-gray-100',
          icon: 'M9 19V6a2 2 0 012-2h2a2 2 0 012 2v13m-6 0a2 2 0 002 2h2a2 2 0 002-2',
          color: 'text-gray-600',
        };
    }
  }
}
