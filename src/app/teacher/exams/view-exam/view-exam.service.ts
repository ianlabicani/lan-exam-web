import { inject, Injectable, signal, computed, Signal } from '@angular/core';
import { ExamApiService } from '../../services/exam-api.service';

/**
 * ViewExamService manages the state for the viewing exam feature.
 * It holds the current exam in a signal and provides helpers to update it.
 * API calls are made directly by components using ExamApiService.
 */
@Injectable({
  providedIn: 'root',
})
export class ViewExamService {
  private api = inject(ExamApiService);

  /**
   * Internal signal that holds the currently viewing exam.
   */
  private currentViewingExam = signal<ViewingExam | null>(null);

  /**
   * Read-only computed view that components can subscribe to.
   * Use `viewingExam()` to read the latest exam or inject it into templates.
   */
  viewingExam = this.currentViewingExam as Signal<ViewingExam | null>;

  /**
   * Set the currently viewing exam.
   */
  setCurrentViewingExam(exam: ViewingExam): void {
    this.currentViewingExam.set(exam);
  }

  /**
   * Clear the currently viewing exam.
   */
  clearCurrentViewingExam(): void {
    this.currentViewingExam.set(null);
  }

  /**
   * Patch the currently viewing exam with partial updates.
   * Returns the updated exam or null if no exam is currently set.
   */
  patchViewingExam(updates: Partial<ViewingExam>): ViewingExam | null {
    const current = this.currentViewingExam();
    if (!current) return null;
    const merged = { ...current, ...updates } as ViewingExam;
    this.currentViewingExam.set(merged);
    return merged;
  }
}

export interface ViewingExam {
  id: number;
  title: string;
  description: null;
  starts_at: Date;
  ends_at: Date;
  year: string[];
  sections: string[];
  status: string;
  total_points: number;
  tos: Tos[];
  created_at: Date;
  updated_at: Date;
  items: Item[];
}

export interface Item {
  id: number;
  exam_id: number;
  type: string;
  level: string;
  question: string;
  points: number;
  expected_answer: null | string;
  answer: null | string;
  options: Option[] | null;
  pairs: Pair[] | null;
  created_at: Date;
  updated_at: Date;
}

export interface Option {
  text: string;
  correct: boolean;
}

export interface Pair {
  left: string;
  right: string;
}

export interface Tos {
  topic: string;
  time_allotment: number;
  no_of_items: number;
  outcomes: any[];
  distribution: Distribution;
}

export interface Distribution {
  easy: Difficult;
  moderate: Difficult;
  difficult: Difficult;
}

export interface Difficult {
  allocation: number;
}
