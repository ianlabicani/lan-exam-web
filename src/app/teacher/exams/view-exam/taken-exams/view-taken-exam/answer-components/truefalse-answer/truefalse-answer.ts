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

  // Normalize boolean-like values (handles true/false strings, '1'/'0', numbers)
  private parseBool(val: any): boolean {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;
    if (typeof val === 'string') {
      const s = val.trim().toLowerCase();
      // Only treat explicit truthy tokens as true. Everything else is false.
      return s === 'true' || s === '1' || s === 'yes';
    }
    return false;
  }

  // Public helpers used by the template
  isCorrectTrue(): boolean {
    const comp = this.comparison && this.comparison();
    return comp ? this.parseBool(comp.correct_answer) : false;
  }

  studentAnsweredTrue(): boolean {
    const ans = this.answer && this.answer();
    return ans ? this.parseBool(ans.answer) : false;
  }
}
