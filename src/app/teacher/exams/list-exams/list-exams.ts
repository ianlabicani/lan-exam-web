import { Exam, ExamService } from '../../services/exam.service';
import {
  DatePipe,
  NgClass,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-exam-list',
  imports: [RouterLink, DatePipe, NgClass, TitleCasePipe],
  templateUrl: './list-exams.html',
  styleUrl: './list-exams.css',
})
export class ListExams implements OnInit {
  examService = inject(ExamService);

  examsSig = signal<Exam[]>([]);

  ngOnInit(): void {
    this.examService.index().subscribe((exams) => {
      this.examsSig.set(exams);
      console.log(exams);
    });
  }

  calculateDuration(startsAt: Date, endsAt: Date): number {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / 60000); // Convert ms to minutes
  }

  getStatusClass(status: string): string {
    const classes = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-800',
    };
    return (
      classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
    );
  }

  remove(id: number) {
    this.examsSig.set(this.examsSig().filter((exam) => exam.id !== id));
    localStorage.setItem('exams', JSON.stringify(this.examsSig()));
  }
}
