import { Component, input } from '@angular/core';
import { ExamItem } from '../../list-exam-items.service';

@Component({
  selector: 'app-essay-item',
  imports: [],
  templateUrl: './essay-item.html',
  styleUrls: ['./essay-item.css'],
})
export class EssayItem {
  itemSig = input.required<ExamItem>();
}
