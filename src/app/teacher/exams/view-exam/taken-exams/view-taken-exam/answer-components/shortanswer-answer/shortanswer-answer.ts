import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shortanswer-answer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shortanswer-answer.html',
  styleUrl: './shortanswer-answer.css',
})
export class ShortanswerAnswerComponent {
  answer = input.required<any>();
  comparison = input.required<any>();
}
