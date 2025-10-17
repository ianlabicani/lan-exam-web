import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCircle,
  faPlus,
  faSpinner,
  faArrowLeft,
  faTimesCircle,
  faInfoCircle,
  faCalendarAlt,
  faTable,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { ExamService } from '../../services/exam.service';

@Component({
  selector: 'app-create-exam',
  imports: [ReactiveFormsModule, FaIconComponent, CommonModule],
  templateUrl: './create-exam.html',
  styleUrl: './create-exam.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateExam implements OnInit {
  private fb = inject(FormBuilder);
  private examService = inject(ExamService);
  private router = inject(Router);

  // Icons
  protected faArrowLeft = faArrowLeft;
  protected faPlus = faPlus;
  protected faSpinner = faSpinner;
  protected faTimesCircle = faTimesCircle;
  protected faInfoCircle = faInfoCircle;
  protected faCalendarAlt = faCalendarAlt;
  protected faTable = faTable;
  protected faChevronDown = faChevronDown;
  protected faChevronUp = faChevronUp;

  // State signals
  protected savingSig = signal<boolean>(false);
  protected errorMsg = signal<string | null>(null);
  protected durationDisplay = signal<string>('Not set');
  protected totalItemsComputed = signal<number>(0);
  protected expandedTopic = signal<number | null>(null);

  protected sectionOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  protected yearOptions = [1, 2, 3, 4];

  // Helper to get current datetime in ISO format for datetime-local input
  private getCurrentDatetimeLocal(): string {
    const now = new Date();
    // Format: YYYY-MM-DDTHH:mm (required by datetime-local)
    return now.toISOString().slice(0, 16);
  }

  // Helper to get future datetime (2 hours from now)
  private getFutureDatetimeLocal(): string {
    const future = new Date();
    future.setHours(future.getHours() + 2);
    return future.toISOString().slice(0, 16);
  }

  examForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    starts_at: [this.getCurrentDatetimeLocal(), Validators.required],
    ends_at: [this.getFutureDatetimeLocal(), Validators.required],
    year: [1 as 1 | 2 | 3 | 4, Validators.required],

    // sections keyed by letter so template binds by value, not index
    sections: this.fb.nonNullable.group(
      {},
      { validators: Validators.required as any }
    ),

    status: 'draft' as 'draft' | 'published' | 'active' | 'archived',
    total_points: [0, Validators.required],

    tos: this.fb.array([]), // topics
  });

  ngOnInit(): void {
    // Initialize a boolean control for each available section letter
    const sectionsGroup = this.sections;
    this.sectionOptions.forEach((letter) => {
      if (!sectionsGroup.get(letter)) {
        sectionsGroup.addControl(letter, this.fb.control(false));
      }
    });

    // Add initial topic
    this.addTopic();

    // Watch for changes in start/end times to recalculate duration
    this.examForm.get('starts_at')?.valueChanges.subscribe(() => {
      this.calculateDuration();
    });
    this.examForm.get('ends_at')?.valueChanges.subscribe(() => {
      this.calculateDuration();
    });

    // Watch for changes in TOS to recalculate total items
    this.tos.statusChanges.subscribe(() => {
      this.recalculateTotalItems();
    });
  }

  /**
   * Calculate duration between start and end times
   */
  private calculateDuration(): void {
    const startsAt = this.examForm.get('starts_at')?.value;
    const endsAt = this.examForm.get('ends_at')?.value;

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

  /**
   * Recalculate total items from all topics
   */
  private recalculateTotalItems(): void {
    const total = (this.tos.value as any[]).reduce((sum, topic) => {
      return sum + (parseInt(topic.no_of_items || 0) || 0);
    }, 0);
    this.totalItemsComputed.set(total);
  }

  /**
   * Auto-calculate distribution based on time allotment
   */
  protected autoCalculateDistribution(topicIndex: number): void {
    const topic = this.tos.at(topicIndex) as FormGroup;
    const totalTimeAllotment = (this.tos.value as any[]).reduce(
      (sum, t) => sum + (parseFloat(t.time_allotment || 0) || 0),
      0
    );

    if (totalTimeAllotment === 0) return;

    const topicTimeAllotment = parseFloat(
      topic.get('time_allotment')?.value || 0
    );
    const totalItems = parseInt(
      this.examForm.get('tos')?.get('0')?.get('no_of_items')?.value || 0
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

    this.recalculateTotalItems();
  }

  /**
   * Toggle topic expansion for mobile/compact view
   */
  protected toggleTopicExpanded(index: number): void {
    if (this.expandedTopic() === index) {
      this.expandedTopic.set(null);
    } else {
      this.expandedTopic.set(index);
    }
  }

  create() {
    if (this.examForm.invalid || this.savingSig()) {
      this.examForm.markAllAsTouched();
      return;
    }
    this.errorMsg.set(null);
    this.savingSig.set(true);

    const raw = this.examForm.getRawValue();

    // Map boolean selections to their letter codes
    const selectedSections = Object.entries(
      this.sections.getRawValue() as Record<string, boolean>
    )
      .filter(([_, checked]) => !!checked)
      .map(([letter]) => letter.toLowerCase());

    // Year must be sent as an array
    const yearArray = [raw.year];

    const payload = {
      title: raw.title,
      description: raw.description,
      starts_at: new Date(raw.starts_at).toISOString(),
      ends_at: new Date(raw.ends_at).toISOString(),
      year: yearArray, // Send as array
      sections: selectedSections, // Already an array
      status: raw.status,
      total_points: 0,
      tos: (this.tos.getRawValue() as any[]).map((t) => ({
        topic: t.topic,
        outcomes: t.outcomes ?? [],
        time_allotment: t.time_allotment,
        no_of_items: t.no_of_items,
        distribution: t.distribution,
      })),
    };

    this.examService.store(payload).subscribe({
      next: (res) => {
        this.savingSig.set(false);
        this.router.navigate(['/teacher/exams/', res.exam.id]);
      },
      error: (err) => {
        this.savingSig.set(false);
        this.errorMsg.set(err?.error?.message || 'Failed to create exam');
      },
    });
  }

  // ========== GETTERS ==========
  get sections(): FormGroup {
    return this.examForm.get('sections') as FormGroup;
  }

  get tos(): FormArray {
    return this.examForm.get('tos') as FormArray;
  }

  // ========== TOPIC HELPERS ==========
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

  addTopic(topicName: string = '') {
    this.tos.push(this.newTopic(topicName));
  }

  removeTopic(index: number) {
    this.tos.removeAt(index);
  }

  // Outcomes helpers
  getOutcomes(topicIndex: number): FormArray {
    return (this.tos.at(topicIndex) as FormGroup).get('outcomes') as FormArray;
  }

  addOutcome(topicIndex: number) {
    this.getOutcomes(topicIndex).push(this.fb.control(''));
  }

  removeOutcome(topicIndex: number, outcomeIndex: number) {
    this.getOutcomes(topicIndex).removeAt(outcomeIndex);
  }

  // Placement helpers for distribution levels
  getPlacement(
    topicIndex: number,
    level: 'easy' | 'moderate' | 'difficult'
  ): FormArray {
    const dist = (this.tos.at(topicIndex) as FormGroup).get(
      'distribution'
    ) as FormGroup;
    const lvl = dist.get(level) as FormGroup;
    return lvl.get('placement') as FormArray;
  }

  addPlacement(topicIndex: number, level: 'easy' | 'moderate' | 'difficult') {
    this.getPlacement(topicIndex, level).push(this.fb.control(''));
  }

  removePlacement(
    topicIndex: number,
    level: 'easy' | 'moderate' | 'difficult',
    placementIndex: number
  ) {
    this.getPlacement(topicIndex, level).removeAt(placementIndex);
  }

  // ========== SECTION HELPERS ==========
  addSection(section: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G') {
    if (!this.sections.get(section)) {
      this.sections.addControl(section, this.fb.control(false));
    }
  }

  removeSection(section: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G') {
    if (this.sections.get(section)) {
      this.sections.removeControl(section);
    }
  }
}
