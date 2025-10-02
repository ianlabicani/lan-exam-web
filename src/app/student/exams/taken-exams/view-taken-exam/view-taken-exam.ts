import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, inject, signal } from '@angular/core';
import { StudentTakenExamService } from '../../../services/student-taken-exam.service';
import { StudentExamItemService } from '../../../services/student-exam-item.service';
import { concatMap } from 'rxjs';
import { ExamHeader } from '../create-taken-exam/exam-header/exam-header';
import { ExamQuestion } from '../create-taken-exam/exam-question/exam-question';
import {
  IExamItem,
  ITakenExam,
  ITakenExamAnswer,
} from '../create-taken-exam/create-taken-exam';

@Component({
  selector: 'app-view-taken-exam',
  standalone: true,
  imports: [ExamHeader, ExamQuestion],
  templateUrl: './view-taken-exam.html',
  styleUrl: './view-taken-exam.css',
})
export class ViewTakenExam implements OnInit {
  private route = inject(ActivatedRoute);
  private takenSvc = inject(StudentTakenExamService);
  private itemSvc = inject(StudentExamItemService);

  takenExamSig = signal<ITakenExam | null>(null);
  examItems = signal<IExamItem[]>([]);
  answers = signal<Record<string, any>>({});

  ngOnInit(): void {
    const takenExamId = this.route.snapshot.params['takenExamId'];

    this.takenSvc
      .getOne(takenExamId as unknown as number)
      .pipe(
        concatMap((res) => {
          const taken = res.takenExam;
          this.takenExamSig.set(taken);
          if (taken.answers?.length) this.setAnswers(taken.answers);
          return this.itemSvc.getExamItems(taken.exam_id);
        })
      )
      .subscribe({
        next: (items) => this.examItems.set(items),
      });
  }

  private setAnswers(answers: ITakenExamAnswer[]) {
    if (!answers?.length) return;
    const restored: Record<string, any> = {};
    answers.forEach((ans) => {
      const key = ans.exam_item_id;
      let value: any = ans.answer;
      if (ans.type === 'mcq') {
        const num = Number(value);
        if (!Number.isNaN(num)) value = num;
      } else if (ans.type === 'truefalse') {
        if (value === '1' || value === 1 || value === true || value === 'true')
          value = true;
        else if (
          value === '0' ||
          value === 0 ||
          value === false ||
          value === 'false'
        )
          value = false;
      } else if (
        ans.type === 'shortanswer' ||
        ans.type === 'fill_blank' ||
        ans.type === 'essay'
      ) {
        value = value ?? '';
        if (typeof value !== 'string') value = String(value);
      } else if (ans.type === 'matching') {
        try {
          if (typeof value === 'string') value = JSON.parse(value);
        } catch (_) {
          value = [];
        }
        if (Array.isArray(value)) {
          value = value.map((v) => {
            const n = typeof v === 'number' ? v : parseInt(String(v), 10);
            return Number.isNaN(n) ? null : n;
          });
        }
      }
      restored[key] = value;
    });
    this.answers.set(restored);
  }
}
