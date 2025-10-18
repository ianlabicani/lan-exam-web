import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFileAlt, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { ExamItem } from '../../../view-exam.service';

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
