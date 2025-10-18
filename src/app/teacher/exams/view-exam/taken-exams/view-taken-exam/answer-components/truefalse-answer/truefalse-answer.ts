import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-truefalse-answer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './truefalse-answer.html',
  styleUrl: './truefalse-answer.css',
})
export class TruefalsAnswerComponent {
  answer = input.required<any>();
  comparison = input.required<any>();
  // Public helpers used by the template. After backend normalization
  // `comparison().correct_answer` and `answer().answer` will be boolean|null
  // for true/false items, so we can use them directly.
  isCorrectTrue(): boolean {
    const comp = this.comparison && this.comparison();
    return !!(comp && comp.correct_answer === true);
  }

  studentAnsweredTrue(): boolean {
    const ans = this.answer && this.answer();
    return !!(ans && ans.answer === true);
  }
}
