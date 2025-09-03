import { NgClass } from '@angular/common';
import { ViewExamItemsService } from './../view-exam-items.service';
import { Component, inject } from '@angular/core';
import { TofItem } from './view-exam-item/tof-item/tof-item';
import { EssayItem } from './view-exam-item/essay-item/essay-item';
import { McqItem } from './view-exam-item/mcq-item/mcq-item';
import { ViewExamItem } from './view-exam-item/view-exam-item';
@Component({
  selector: 'app-teacher-view-exam-items-list',
  imports: [ViewExamItem],
  templateUrl: './view-exam-items-list.html',
  styleUrl: './view-exam-items-list.css',
})
export class ViewExamItemsList {
  private viewExamItemsService = inject(ViewExamItemsService);
  itemsSig = this.viewExamItemsService.itemsSig;
}
