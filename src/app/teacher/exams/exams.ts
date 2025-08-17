import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';

export interface IExam {
  id: string;
  title: string;
  description?: string;
  startsAt?: Date;
  endsAt?: Date;
  duration?: number;
  status: 'draft' | 'published' | 'archived' | 'active';
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-exams',
  imports: [RouterLink, DatePipe, NgClass],
  templateUrl: './exams.html',
  styleUrl: './exams.css',
})
export class Exams implements OnInit {
  exams = signal<IExam[]>([]);

  ngOnInit(): void {
    this.seedExams();
    this.loadExams();
  }

  private loadExams() {
    const exams = localStorage.getItem('exams');
    if (exams) {
      this.exams.set(JSON.parse(exams));
    }
  }

  private seedExams() {
    if (!localStorage.getItem('exams')) {
      localStorage.setItem(
        'exams',
        JSON.stringify([
          {
            id: '1',
            title: 'Math Exam',
            description: 'A comprehensive math exam.',
            duration: 60,
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            title: 'Science Exam',
            description: 'A comprehensive science exam.',
            duration: 45,
            status: 'published',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ])
      );
    }
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

  remove(id: string) {
    this.exams.set(this.exams().filter((exam) => exam.id !== id));
    localStorage.setItem('exams', JSON.stringify(this.exams()));
  }
}
