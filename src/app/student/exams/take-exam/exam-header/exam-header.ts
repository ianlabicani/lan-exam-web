import { Component, Input } from '@angular/core';
import { ITakenExam } from '../take-exam';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-exam-header',
  imports: [DatePipe],
  templateUrl: './exam-header.html',
  styleUrl: './exam-header.css',
})
export class ExamHeader {
  @Input() exam: ITakenExam | null = null;
}
