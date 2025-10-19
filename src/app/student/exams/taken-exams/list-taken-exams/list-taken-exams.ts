import { RouterLink } from '@angular/router';
import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFileLines,
  faCheckCircle,
  faClock,
  faEye,
  faArrowRight,
  faCircle,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-list-taken-exams',
  imports: [RouterLink, TitleCasePipe, DatePipe, FontAwesomeModule],
  templateUrl: './list-taken-exams.html',
  styleUrl: './list-taken-exams.css',
})
export class ListTakenExams implements OnInit {
  http = inject(HttpClient);

  takenExams = signal<any[]>([]);

  // FontAwesome icons
  faFileLines = faFileLines;
  faCheckCircle = faCheckCircle;
  faClock = faClock;
  faEye = faEye;
  faArrowRight = faArrowRight;
  faCircle = faCircle;

  ngOnInit(): void {
    this.getTakenExams();
  }

  getTakenExams() {
    this.http
      .get<{ data: TakenExam[] }>(
        `http://127.0.0.1:8000/api/student/taken-exams`
      )
      .subscribe({
        next: (res) => {
          this.takenExams.set(res.data);
        },
      });
  }
}

interface TakenExam {
  id: number;
  exam_id: number;
  type: string;
  user_id: number;
  started_at: Date;
  submitted_at: null;
  total_points: number;
  created_at: Date;
  updated_at: Date;
  exam: Exam;
}

interface Exam {
  id: number;
  title: string;
  description: string;
  starts_at: Date;
  ends_at: Date;
  year: string;
  sections: string[];
  status: string;
  total_points: number;
  tos: To[];
  created_at: Date;
  updated_at: Date;
}

interface To {
  topic: string;
  outcomes: string[];
  time_allotment: number;
  no_of_items: number;
  distribution: Distribution;
}

interface Distribution {
  easy: Difficult;
  moderate: Difficult;
  difficult: Difficult;
}

interface Difficult {
  allocation: number;
  placement: any[];
}
