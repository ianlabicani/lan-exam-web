import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { McqItem } from './mcq-item/mcq-item';
import { TofItem } from './tof-item/tof-item';
import { EssayItem } from './essay-item/essay-item';

@Component({
  selector: 'app-view-exam-item',
  imports: [McqItem, TofItem, EssayItem],
  templateUrl: './view-exam-item.html',
  styleUrl: './view-exam-item.css',
})
export class ViewExamItem {
  itemSig = input<any>();
}
