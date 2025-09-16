import { Component, input } from '@angular/core';
import { ExamItem } from '../../../../services/exam-item.service';

@Component({
  selector: 'app-matching-item',
  imports: [],
  templateUrl: './matching-item.html',
  styleUrls: ['./matching-item.css'],
})
export class MatchingItem {
  itemSig = input.required<ExamItem>();
}
