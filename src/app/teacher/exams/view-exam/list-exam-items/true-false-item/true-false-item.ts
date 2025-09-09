import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { IExamItem } from '../list-exam-items';

@Component({
  selector: 'app-true-false-item',
  imports: [NgClass],
  templateUrl: './true-false-item.html',
  styleUrls: ['./true-false-item.css'],
})
export class TrueFalseItem {
  itemSig = input.required<IExamItem>();
}
