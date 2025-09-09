import { Component, input } from '@angular/core';
import { IExamItem } from '../list-exam-items';

@Component({
  selector: 'app-essay-item',
  imports: [],
  templateUrl: './essay-item.html',
  styleUrls: ['./essay-item.css'],
})
export class EssayItem {
  itemSig = input.required<IExamItem>();
}
