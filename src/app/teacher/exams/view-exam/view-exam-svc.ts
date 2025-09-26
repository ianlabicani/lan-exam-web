import { Injectable, signal } from '@angular/core';
import { Exam } from '../../services/exam.service';

@Injectable({
  providedIn: 'root',
})
export class ViewExamSvc {
  exam = signal<Exam | null>(null);
}
