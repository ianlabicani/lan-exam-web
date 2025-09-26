import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { IExamItem } from '../create-taken-exam';

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

  // Generic text handler (fill_blank, shortanswer)
  onText(val: string) {
    if (this.essayTimer) clearTimeout(this.essayTimer);
    this.essayTimer = setTimeout(() => this.answerChange.emit(val), 600);
  }

  // Matching: answer as array where index = left item index, value = selected right index
  setMatching(leftIndex: number, raw: any) {
    const parsed = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
    const rightIndex = Number.isNaN(parsed) ? null : parsed;
    const len = this.item?.pairs?.length ?? 0;
    const current = Array.isArray(this.currentAnswer)
      ? [...this.currentAnswer]
      : Array(len).fill(null);
    current[leftIndex] = rightIndex;
    this.answerChange.emit(current);
  }
}
