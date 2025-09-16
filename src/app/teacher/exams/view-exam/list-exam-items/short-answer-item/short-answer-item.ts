import { Component, input } from '@angular/core';
import { ExamItem } from '../../../../services/exam-item.service';

@Component({
  selector: 'app-short-answer-item',
  imports: [],
  templateUrl: './short-answer-item.html',
  styleUrls: ['./short-answer-item.css'],
})
export class ShortAnswerItem {
  itemSig = input.required<ExamItem>();
}
