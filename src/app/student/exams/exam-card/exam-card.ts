import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-exam-card',
  imports: [NgClass, TitleCasePipe, DatePipe],
  templateUrl: './exam-card.html',
  styleUrl: './exam-card.css',
})
export class ExamCard {
  @Input() exam!: any;
  @Input() icon!: { bg: string; color: string; icon: string };
  @Output() openExam = new EventEmitter<any>();

  statusBadgeClass(status: string) {
    return (
      {
        draft: 'bg-gray-100 text-gray-700',
        active: 'bg-blue-100 text-blue-700',
        published: 'bg-green-100 text-green-700',
      }[status] ?? 'bg-gray-200 text-gray-600'
    );
  }

  buttonClass(status: string) {
    return (
      {
        draft: 'bg-gray-400',
        active: 'bg-blue-600 hover:bg-blue-700',
        published: 'bg-green-600 hover:bg-green-700',
        archived: 'bg-gray-300 cursor-not-allowed',
      }[status] ?? 'bg-gray-300 cursor-not-allowed'
    );
  }

  statusMessage(status: string) {
    return (
      {
        draft: 'This exam is in draft mode.',
        published: 'This exam is published and ready for students.',
        active: 'Start Exam',
        archived: 'This exam is archived and no longer available.',
      }[status] ?? 'Unavailable'
    );
  }
}
