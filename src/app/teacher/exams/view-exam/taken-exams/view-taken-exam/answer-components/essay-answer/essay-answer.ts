import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-essay-answer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './essay-answer.html',
  styleUrl: './essay-answer.css',
})
export class EssayAnswerComponent {
  answer = input.required<any>();
  comparison = input.required<any>();
}
