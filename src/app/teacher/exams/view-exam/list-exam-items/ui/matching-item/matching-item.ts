import { Component, input } from '@angular/core';
import { ExamItem } from '../../list-exam-items.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faLink,
  faArrowRight,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-matching-item',
  imports: [FontAwesomeModule],
  templateUrl: './matching-item.html',
  styleUrls: ['./matching-item.css'],
})
export class MatchingItem {
  itemSig = input.required<ExamItem>();

  faLink = faLink;
  faArrowRight = faArrowRight;
  faArrowLeft = faArrowLeft;
}
