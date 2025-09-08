import { NgClass } from '@angular/common';
import { ViewExamItemListService } from './view-exam-item-list.service';
import { Component, inject, input, OnInit } from '@angular/core';
import { McqItem } from './mcq-item/mcq-item';

@Component({
  selector: 'app-teacher-view-exam-item-list',
  imports: [NgClass, McqItem],
  templateUrl: './view-exam-item-list.html',
  styleUrl: './view-exam-item-list.css',
})
export class ViewExamItemList implements OnInit {
  examIdSig = input.required<number>();
  viewExamItemListService = inject(ViewExamItemListService);

  examItemsSig = this.viewExamItemListService.itemsSig;

  ngOnInit(): void {
    this.viewExamItemListService.getExamItems(this.examIdSig()).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.error('Error fetching exam items:', err);
      },
    });
  }
}
