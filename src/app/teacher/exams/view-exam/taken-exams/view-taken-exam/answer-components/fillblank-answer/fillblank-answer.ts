import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fillblank-answer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fillblank-answer.html',
  styleUrl: './fillblank-answer.css',
})
export class FillblankAnswerComponent {
  answer = input.required<any>();
  comparison = input.required<any>();
}
