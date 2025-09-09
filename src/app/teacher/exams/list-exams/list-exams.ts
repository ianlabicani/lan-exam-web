import {
  DatePipe,
  NgClass,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-exam-list',
  imports: [RouterLink, DatePipe, NgClass, TitleCasePipe, UpperCasePipe],
  templateUrl: './list-exams.html',
  styleUrl: './list-exams.css',
})
export class ListExams implements OnInit {
  http = inject(HttpClient);

  examsSig = signal<IGetExamsData[]>([]);

  ngOnInit(): void {
    this.getExams().subscribe((res) => {
      this.examsSig.set(res.exams);
    });
  }

  getExams() {
    return this.http.get<{ exams: IGetExamsData[] }>(
      `${environment.apiBaseUrl}/teacher/exams`
    );
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

interface IGetExamsData {
  id: number;
  title: string;
  description: string;
  starts_at: Date;
  ends_at: Date;
  year: string;
  section: string;
  status: string;
  total_points: number;
  created_at: Date;
  updated_at: Date;
  pivot: Pivot;
}

interface Pivot {
  teacher_id: number;
  exam_id: number;
}
