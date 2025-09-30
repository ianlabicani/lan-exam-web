import { Exam } from '../../services/exam.service';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Component({
  selector: 'app-exam-list',
  imports: [RouterLink, DatePipe, NgClass, TitleCasePipe],
  templateUrl: './list-exams.html',
  styleUrl: './list-exams.css',
})
export class ListExams implements OnInit {
  http = inject(HttpClient);

  exams = signal<GetExamsData[]>([]);

  ngOnInit(): void {
    this.getExams().subscribe((res) => {
      const examsWithDuration = res.data.map((exam) => ({
        ...exam,
        durationInMins: this.calculateDuration(exam.starts_at, exam.ends_at),
      }));

      this.exams.set(examsWithDuration);
      console.log(res);
    });
  }

  getExams() {
    return this.http.get<{ data: GetExamsData[] }>(
      `${environment.apiBaseUrl}/teacher/exams`
    );
  }

  calculateDuration(startsAt: Date | string, endsAt: Date | string): number {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / 60000); // Convert ms to minutes
  }
}

interface GetExamsData {
  id: number;
  title: string;
  description: string;
  starts_at: Date;
  ends_at: Date;
  year: string;
  sections: string[];
  status: string;
  total_points: number;
  created_at: Date;
  updated_at: Date;

  // Additional property for duration in minutes
  durationInMins?: number;
}
