import { Component, input } from '@angular/core';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { ITakenExam } from '../create-taken-exam';

@Component({
  selector: 'app-exam-header',
  imports: [DatePipe, NgClass, TitleCasePipe],
  templateUrl: './exam-header.html',
  styleUrl: './exam-header.css',
})
export class ExamHeader {
  takenExamSig = input.required<ITakenExam>();
}
