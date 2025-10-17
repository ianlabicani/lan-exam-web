import { Component, input } from '@angular/core';
import { ExamItem } from '../../list-exam-items.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFileAlt, faLightbulb } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-essay-item',
  imports: [FontAwesomeModule],
  templateUrl: './essay-item.html',
  styleUrls: ['./essay-item.css'],
})
export class EssayItem {
  itemSig = input.required<ExamItem>();

  faFileAlt = faFileAlt;
  faLightbulb = faLightbulb;
}
