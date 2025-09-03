import {
  DatePipe,
  NgClass,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import { ExamService, IExam } from './../exam.service';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-exam',
  imports: [NgClass, DatePipe, UpperCasePipe, TitleCasePipe, RouterLink],
  templateUrl: './list-exam.html',
  styleUrl: './list-exam.css',
})
export class ListExam {
  examService = inject(ExamService);
  examsSig = signal<IExam[]>([]);

  loadExams() {
    this.examService.getAllExams().subscribe((res) => {
      this.examsSig.set(res.exams);
    });
  }
}
