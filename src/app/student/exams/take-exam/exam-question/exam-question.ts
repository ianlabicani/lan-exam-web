import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { IExamItem } from '../take-exam';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-exam-question',
  imports: [NgClass],
  templateUrl: './exam-question.html',
  styleUrl: './exam-question.css',
})
export class ExamQuestion {
  @Input() item!: IExamItem;
  @Input() index = 0;
  @Input() currentAnswer: any;
  @Output() answerChange = new EventEmitter<any>();
  isReadonlySig = input<boolean>(false);

  letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private essayTimer: any;

  setMcq(idx: number) {
    this.answerChange.emit(idx);
  }
  setTrueFalse(val: boolean) {
    this.answerChange.emit(val);
  }
  onEssay(val: string) {
    if (this.essayTimer) clearTimeout(this.essayTimer);
    this.essayTimer = setTimeout(() => this.answerChange.emit(val), 600);
  }
}
