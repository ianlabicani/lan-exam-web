import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { ExamItem } from '../../list-exam-items.service';
@Component({
  selector: 'app-true-false-item',
  imports: [NgClass],
  templateUrl: './true-false-item.html',
  styleUrls: ['./true-false-item.css'],
})
export class TrueFalseItem {
  itemSig = input.required<ExamItem>();
}
