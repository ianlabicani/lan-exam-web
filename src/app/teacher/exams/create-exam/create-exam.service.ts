import { Injectable, inject, signal, computed } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExamApiService } from '../../services/exam-api.service';

/**
 * CreateExamService manages state and logic for exam creation.
 * Handles form state, duration calculations, and distribution logic.
 */
@Injectable({
  providedIn: 'root',
})
export class CreateExamService {
  private api = inject(ExamApiService);
  private fb = inject(FormBuilder);

  // ========== STATE SIGNALS ==========
  saving = signal(false);
  errorMsg = signal<string | null>(null);
  durationDisplay = signal<string>('Not set');
  totalItemsComputed = signal<number>(0);
  expandedTopic = signal<number | null>(null);

  sectionOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  yearOptions = [1, 2, 3, 4];

  // ========== FORM SETUP ==========

  /**
   * Create a new exam form group with initial values.
   */
  createExamForm(): FormGroup {
    return this.fb.nonNullable.group({
      title: ['', Validators.required],
      description: [''],
      starts_at: [this.getCurrentDatetimeLocal(), Validators.required],
      ends_at: [this.getFutureDatetimeLocal(), Validators.required],
      year: [1 as 1 | 2 | 3 | 4, Validators.required],
      sections: this.fb.nonNullable.group(
        {},
        { validators: Validators.required as any }
      ),
      status: 'draft' as 'draft' | 'published' | 'active' | 'archived',
      total_points: [0, Validators.required],
      tos: this.fb.array([]),
    });
  }

  /**
   * Initialize section controls in the sections form group.
   */
  initializeSections(sectionsGroup: FormGroup): void {
    this.sectionOptions.forEach((letter) => {
      if (!sectionsGroup.get(letter)) {
        sectionsGroup.addControl(letter, this.fb.control(false));
      }
    });
  }

  /**
   * Create a new topic form group for the TOS array.
   */
  newTopic(topicName: string = ''): FormGroup {
    return this.fb.group({
      topic: [topicName, Validators.required],
      outcomes: this.fb.array<string | null>([]),
      time_allotment: [0, Validators.required],
      no_of_items: [0, Validators.required],
      distribution: this.fb.group({
        easy: this.fb.group({
          allocation: [0, Validators.required],
          placement: this.fb.array<string | null>([]),
        }),
        moderate: this.fb.group({
          allocation: [0, Validators.required],
          placement: this.fb.array<string | null>([]),
        }),
        difficult: this.fb.group({
          allocation: [0, Validators.required],
          placement: this.fb.array<string | null>([]),
        }),
      }),
    });
  }

  // ========== DURATION CALCULATION ==========

  /**
   * Calculate and update duration display based on form values.
   */
  calculateDuration(startsAt: string, endsAt: string): void {
    if (!startsAt || !endsAt) {
      this.durationDisplay.set('Not set');
      return;
    }

    try {
      const start = new Date(startsAt);
      const end = new Date(endsAt);
      const diffMs = end.getTime() - start.getTime();

      if (diffMs <= 0) {
        this.durationDisplay.set('Invalid (end before start)');
        return;
      }

      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;

      const parts: string[] = [];
      if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
      if (remainingHours > 0)
        parts.push(`${remainingHours} hour${remainingHours > 1 ? 's' : ''}`);
      if (minutes > 0) parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);

      this.durationDisplay.set(
        parts.length > 0 ? parts.join(', ') : 'Less than a minute'
      );
    } catch (e) {
      this.durationDisplay.set('Invalid date');
    }
  }

  // ========== DISTRIBUTION CALCULATION ==========

  /**
   * Auto-calculate question distribution based on time allotment.
   * Distribution: 30% easy, 50% moderate, 20% difficult.
   */
  autoCalculateDistribution(formGroup: FormGroup, topicIndex: number): void {
    const tosArray = formGroup.get('tos') as FormArray;
    const topic = tosArray.at(topicIndex) as FormGroup;

    const totalTimeAllotment = (tosArray.value as any[]).reduce(
      (sum, t) => sum + (parseFloat(t.time_allotment || 0) || 0),
      0
    );

    if (totalTimeAllotment === 0) return;

    const topicTimeAllotment = parseFloat(
      topic.get('time_allotment')?.value || 0
    );
    const totalItems = (tosArray.value as any[]).reduce(
      (sum, t) => sum + (parseInt(t.no_of_items || 0) || 0),
      0
    );

    if (totalItems <= 0) return;

    const proportion = topicTimeAllotment / totalTimeAllotment;
    const itemsForTopic = Math.round(proportion * totalItems);

    // Calculate distribution: 30% easy, 50% moderate, 20% difficult
    const distribution = topic.get('distribution') as FormGroup;
    const easy = Math.round(itemsForTopic * 0.3);
    const difficult = Math.round(itemsForTopic * 0.2);
    const moderate = itemsForTopic - easy - difficult;

    distribution.patchValue({
      easy: { allocation: Math.max(0, easy) },
      moderate: { allocation: Math.max(0, moderate) },
      difficult: { allocation: Math.max(0, difficult) },
    });

    this.recalculateTotalItems(tosArray);
  }

  /**
   * Recalculate total items from all topics in TOS array.
   */
  recalculateTotalItems(tosArray: FormArray): void {
    const total = (tosArray.value as any[]).reduce((sum, topic) => {
      return sum + (parseInt(topic.no_of_items || 0) || 0);
    }, 0);
    this.totalItemsComputed.set(total);
  }

  // ========== TOPIC MANAGEMENT ==========

  /**
   * Add a new topic to the TOS array.
   */
  addTopic(tosArray: FormArray, topicName: string = ''): void {
    tosArray.push(this.newTopic(topicName));
  }

  /**
   * Remove a topic from the TOS array.
   */
  removeTopic(tosArray: FormArray, index: number): void {
    tosArray.removeAt(index);
  }

  /**
   * Toggle topic expansion for mobile/compact view.
   */
  toggleTopicExpanded(index: number): void {
    if (this.expandedTopic() === index) {
      this.expandedTopic.set(null);
    } else {
      this.expandedTopic.set(index);
    }
  }

  // ========== OUTCOME MANAGEMENT ==========

  /**
   * Get outcomes FormArray for a specific topic.
   */
  getOutcomes(tosArray: FormArray, topicIndex: number): FormArray {
    return (tosArray.at(topicIndex) as FormGroup).get('outcomes') as FormArray;
  }

  /**
   * Add an outcome to a topic.
   */
  addOutcome(tosArray: FormArray, topicIndex: number): void {
    this.getOutcomes(tosArray, topicIndex).push(this.fb.control(''));
  }

  /**
   * Remove an outcome from a topic.
   */
  removeOutcome(
    tosArray: FormArray,
    topicIndex: number,
    outcomeIndex: number
  ): void {
    this.getOutcomes(tosArray, topicIndex).removeAt(outcomeIndex);
  }

  // ========== PLACEMENT MANAGEMENT ==========

  /**
   * Get placement FormArray for a distribution level.
   */
  getPlacement(
    tosArray: FormArray,
    topicIndex: number,
    level: 'easy' | 'moderate' | 'difficult'
  ): FormArray {
    const dist = (tosArray.at(topicIndex) as FormGroup).get(
      'distribution'
    ) as FormGroup;
    const lvl = dist.get(level) as FormGroup;
    return lvl.get('placement') as FormArray;
  }

  /**
   * Add a placement for a distribution level.
   */
  addPlacement(
    tosArray: FormArray,
    topicIndex: number,
    level: 'easy' | 'moderate' | 'difficult'
  ): void {
    this.getPlacement(tosArray, topicIndex, level).push(this.fb.control(''));
  }

  /**
   * Remove a placement from a distribution level.
   */
  removePlacement(
    tosArray: FormArray,
    topicIndex: number,
    level: 'easy' | 'moderate' | 'difficult',
    placementIndex: number
  ): void {
    this.getPlacement(tosArray, topicIndex, level).removeAt(placementIndex);
  }

  // ========== API CALLS ==========

  /**
   * Create a new exam via the API.
   */
  createExam(payload: any) {
    return this.api.store(payload);
  }

  // ========== PRIVATE HELPERS ==========

  private getCurrentDatetimeLocal(): string {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  }

  private getFutureDatetimeLocal(): string {
    const future = new Date();
    future.setHours(future.getHours() + 2);
    return future.toISOString().slice(0, 16);
  }
}
