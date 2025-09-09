import { Component, input } from '@angular/core';
import { ITakenExam } from '../take-exam';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-exam-header',
  imports: [DatePipe, NgClass, TitleCasePipe],
  templateUrl: './exam-header.html',
  styleUrl: './exam-header.css',
})
export class ExamHeader {
  takenExamSig = input.required<ITakenExam>();
}
