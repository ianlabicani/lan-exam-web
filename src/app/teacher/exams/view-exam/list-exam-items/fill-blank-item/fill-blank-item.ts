import { Component, input } from '@angular/core';
import { ExamItem } from '../list-exam-items.service';

@Component({
  selector: 'app-fill-blank-item',
  imports: [],
  templateUrl: './fill-blank-item.html',
  styleUrls: ['./fill-blank-item.css'],
})
export class FillBlankItem {
  itemSig = input.required<ExamItem>();
}
