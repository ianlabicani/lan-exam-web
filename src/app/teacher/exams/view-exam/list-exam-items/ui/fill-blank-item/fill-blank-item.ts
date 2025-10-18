import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPen, faBullseye } from '@fortawesome/free-solid-svg-icons';
import { ExamItem } from '../../../view-exam.service';

@Component({
  selector: 'app-fill-blank-item',
  imports: [FontAwesomeModule],
  templateUrl: './fill-blank-item.html',
  styleUrls: ['./fill-blank-item.css'],
})
export class FillBlankItem {
  itemSig = input.required<ExamItem>();

  faPen = faPen;
  faBullseye = faBullseye;
}
