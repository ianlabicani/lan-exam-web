import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faComment, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { ExamItem } from '../../../view-exam.service';

@Component({
  selector: 'app-short-answer-item',
  imports: [FontAwesomeModule],
  templateUrl: './short-answer-item.html',
  styleUrls: ['./short-answer-item.css'],
})
export class ShortAnswerItem {
  itemSig = input.required<ExamItem>();

  faComment = faComment;
  faLightbulb = faLightbulb;
}
