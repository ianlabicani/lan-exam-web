import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faFlag } from '@fortawesome/free-solid-svg-icons';
import { ExamItem } from '../../../view-exam.service';

@Component({
  selector: 'app-true-false-item',
  imports: [FontAwesomeModule],
  templateUrl: './true-false-item.html',
  styleUrls: ['./true-false-item.css'],
})
export class TrueFalseItem {
  itemSig = input.required<ExamItem>();

  faCheckCircle = faCheckCircle;
  faFlag = faFlag;
}
