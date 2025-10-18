import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mcq-answer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mcq-answer.html',
  styleUrl: './mcq-answer.css',
})
export class McqAnswerComponent {
  answer = input.required<any>();
  comparison = input.required<any>();
}
