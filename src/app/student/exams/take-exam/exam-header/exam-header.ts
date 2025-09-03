import { Component, input, Input, OnInit } from '@angular/core';
import { ITakenExam } from '../take-exam';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { ExamProgress } from '../exam-progress/exam-progress';

@Component({
  selector: 'app-exam-header',
  imports: [DatePipe, ExamProgress, NgClass, TitleCasePipe],
  templateUrl: './exam-header.html',
  styleUrl: './exam-header.css',
})
export class ExamHeader implements OnInit {
  takenExamSig = input.required<ITakenExam>();
  ngOnInit(): void {
    console.log(this.takenExamSig());
  }
}
