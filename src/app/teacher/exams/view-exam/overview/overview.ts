import {
  Component,
  inject,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { ViewExamService } from '../view-exam.service';
import { ExamDetails } from '../exam-details/exam-details';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [ExamDetails],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Overview {
  private viewExamSvc = inject(ViewExamService);

  exam = computed(() => this.viewExamSvc.exam());
}
