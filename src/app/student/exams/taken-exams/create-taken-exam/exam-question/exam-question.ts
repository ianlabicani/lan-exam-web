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

  getCurrentAnswer(leftIndex: number): string {
    // Parse answer if it's a JSON string (from backend reload)
    let answers = this.currentAnswer;

    if (typeof answers === 'string') {
      try {
        answers = JSON.parse(answers);
      } catch {
        return '';
      }
    }

    if (!Array.isArray(answers)) {
      return '';
    }

    const matchedItem = answers[leftIndex];
    if (!matchedItem || typeof matchedItem !== 'object' || !matchedItem.right) {
      return '';
    }

    return matchedItem.right;
  }

  // Matching: answer as array of objects { left, right }
  setMatching(leftIndex: number, rightIndex: string) {
    const pairs = this.item?.pairs ?? [];

    // Parse answer if it's a JSON string (from backend reload)
    let current: any[] = [];
    if (Array.isArray(this.currentAnswer)) {
      current = [...this.currentAnswer];
    } else if (typeof this.currentAnswer === 'string') {
      try {
        current = JSON.parse(this.currentAnswer) || [];
      } catch {
        current = [];
      }
    }

    // Ensure array has enough slots
    while (current.length <= leftIndex) {
      current.push(null);
    }

    if (rightIndex === '') {
      // Remove the match if empty selection
      current[leftIndex] = null;
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
