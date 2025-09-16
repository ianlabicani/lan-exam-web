import { Component, input } from '@angular/core';
import { ExamItem } from '../../../../services/exam-item.service';

@Component({
  selector: 'app-fill-blank-item',
  imports: [],
  templateUrl: './fill-blank-item.html',
  styleUrls: ['./fill-blank-item.css'],
})
export class FillBlankItem {
  itemSig = input.required<ExamItem>();
}
