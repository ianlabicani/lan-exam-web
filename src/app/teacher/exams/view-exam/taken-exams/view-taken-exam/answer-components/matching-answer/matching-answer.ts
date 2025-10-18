import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-matching-answer',
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  templateUrl: './matching-answer.html',
  styleUrl: './matching-answer.css',
})
export class MatchingAnswerComponent {
  answer = input.required<any>();
  comparison = input.required<any>();

  protected readonly faCheckCircle = faCheckCircle;
  protected readonly faTimesCircle = faTimesCircle;
  protected readonly faArrowRight = faArrowRight;

  parseJson(data: any): any {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
    return data;
  }

  isCorrectMatch(studentPair: any, expectedPairs: any[]): boolean {
    if (!expectedPairs || !Array.isArray(expectedPairs)) {
      return false;
    }
    if (!studentPair) {
      return false;
    }
    const result = expectedPairs.some(
      (p) => p?.left === studentPair.left && p?.right === studentPair.right
    );
    return result;
  }

  getCorrectRightValue(leftValue: string, expectedPairs: any[]): string | null {
    if (!expectedPairs || !Array.isArray(expectedPairs)) {
      return null;
    }
    const pair = expectedPairs.find((p) => p?.left === leftValue);
    return pair?.right ?? null;
  }

  isArrayType(value: any): boolean {
    return Array.isArray(value);
  }
}
