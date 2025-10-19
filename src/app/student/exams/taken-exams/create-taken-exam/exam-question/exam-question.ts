import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { IExamItem } from '../create-taken-exam';
import { ExamItem } from '../../view-taken-exam/view-taken-exam';

@Component({
  selector: 'app-exam-question',
  imports: [NgClass],
  templateUrl: './exam-question.html',
  styleUrl: './exam-question.css',
})
export class ExamQuestion {
  @Input() item!: IExamItem | ExamItem;
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

  getMatchingRightIndex(leftIndex: number): string {
    const matchedItem = this.currentAnswer?.[leftIndex];
    if (!matchedItem?.right || !this.item?.pairs) return '';
    const foundIndex = this.item.pairs.findIndex(
      (pair: any) => pair.right === matchedItem.right
    );
    return foundIndex >= 0 ? '' + foundIndex : '';
  }

  // Matching: answer as array of objects { left, right }
  setMatching(leftIndex: number, rightIndex: string) {
    const pairs = this.item?.pairs ?? [];
    const current = Array.isArray(this.currentAnswer)
      ? [...this.currentAnswer]
      : [];

    if (rightIndex === '') {
      // Remove the match if empty selection
      current.splice(leftIndex, 1);
    } else {
      const parsedRightIndex = parseInt(rightIndex, 10);
      if (!Number.isNaN(parsedRightIndex) && parsedRightIndex < pairs.length) {
        const leftPair = pairs[leftIndex];
        const rightPair = pairs[parsedRightIndex];
        if (leftPair && rightPair) {
          current[leftIndex] = {
            left: leftPair.left,
            right: rightPair.right,
          };
        }
      }
    }

    this.answerChange.emit(current);
  }
}
