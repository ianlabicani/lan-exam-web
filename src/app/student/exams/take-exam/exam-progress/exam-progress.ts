import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-exam-progress',
  imports: [DecimalPipe],
  templateUrl: './exam-progress.html',
  styleUrl: './exam-progress.css',
})
export class ExamProgress {
  @Input() answered = 0;
  @Input() total = 0;
  get percent() {
    return this.total ? (this.answered / this.total) * 100 : 0;
  }
}
