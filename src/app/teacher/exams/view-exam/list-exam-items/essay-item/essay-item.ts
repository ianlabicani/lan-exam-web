import { Component, input } from '@angular/core';
import { ExamItem } from '../../../../services/exam-item.service';

@Component({
  selector: 'app-essay-item',
  imports: [],
  templateUrl: './essay-item.html',
  styleUrls: ['./essay-item.css'],
})
export class EssayItem {
  itemSig = input.required<ExamItem>();
}
