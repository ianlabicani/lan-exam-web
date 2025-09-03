import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-view-exam-count-card',
  imports: [],
  templateUrl: './view-exam-count-card.html',
  styleUrl: './view-exam-count-card.css',
})
export class ViewExamCountCard {
  totalPointsSig = input<number>();
  titleSig = input<string>();
  colorSig = input<string>();
}
