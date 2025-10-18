import {
  Component,
  inject,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faEdit,
  faExclamationTriangle,
  faInfoCircle,
  faHeading,
  faExclamationCircle,
  faAlignLeft,
  faCalendar,
  faUsers,
  faCalendarAlt,
  faPlayCircle,
  faStopCircle,
  faTable,
  faTrash,
  faPlus,
  faTimes,
  faSave,
  faChartBar,
  faCircle,
  faChevronDown,
  faChevronUp,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { ExamApiService } from '../../../../services/exam-api.service';

export interface EditExamData {
  id: number;
  title: string;
  description?: string | null;
  starts_at: Date | string;
  ends_at: Date | string;
  year: string[] | number[];
  sections: string[];
  tos: TosItem[];
}

export interface TosItem {
  topic: string;
  time_allotment: number;
  no_of_items: number;
  outcomes: string[];
  distribution: {
    easy: { allocation: number; placement?: string[] };
    moderate: { allocation: number; placement?: string[] };
    difficult: { allocation: number; placement?: string[] };
  };
}

@Component({
  selector: 'app-edit-exam',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FontAwesomeModule],
  templateUrl: './edit-exam.html',
  styleUrl: './edit-exam.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditExam {
  private fb = inject(FormBuilder);
  private examApi = inject(ExamApiService);

  // Inputs
  exam = input<EditExamData | null>(null);
  showHeader = input<boolean>(true);

  // Outputs
  submitted = output<EditExamData>();
  cancelled = output<void>();

  // Signals
  saving = signal(false);
  error = signal<string | null>(null);
  expandedTopic = signal<number | null>(null);
  durationDisplay = signal<string>('Not set');
  totalItemsComputed = signal<number>(0);

  // Form
  examForm!: FormGroup;

  // Options
  yearOptions = ['1', '2', '3', '4'];
  sectionOptions = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  // Icons
  faArrowLeft = faArrowLeft;
  faEdit = faEdit;
  faExclamationTriangle = faExclamationTriangle;
  faInfoCircle = faInfoCircle;
  faHeading = faHeading;
  faExclamationCircle = faExclamationCircle;
  faAlignLeft = faAlignLeft;
  faCalendar = faCalendar;
  faUsers = faUsers;
  faCalendarAlt = faCalendarAlt;
  faPlayCircle = faPlayCircle;
  faStopCircle = faStopCircle;
  faTable = faTable;
  faTrash = faTrash;
  faPlus = faPlus;
  faTimes = faTimes;
  faSave = faSave;
  faChartBar = faChartBar;
  faCircle = faCircle;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faTimesCircle = faTimesCircle;

  constructor() {
    this.initForm();

    // Watch for exam input changes and populate form
    effect(() => {
      const currentExam = this.exam();
      if (currentExam) {
        this.populateForm(currentExam);
      }
    });
  }

  initForm(): void {
    this.examForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      year: [[]],
      sections: [[]],
      starts_at: ['', Validators.required],
      ends_at: ['', Validators.required],
      tos: this.fb.array([this.createTosItem()]),
    });
  }

  createTosItem(): FormGroup {
    return this.fb.group({
      topic: ['', Validators.required],
      time_allotment: [0, Validators.required],
      no_of_items: [{ value: 0, disabled: true }],
      outcomes: this.fb.array<string>([]),
      distribution: this.fb.group({
        easy: this.fb.group({
          allocation: [0, Validators.required],
          placement: this.fb.array<string>([]),
        }),
        moderate: this.fb.group({
          allocation: [0, Validators.required],
          placement: this.fb.array<string>([]),
        }),
        difficult: this.fb.group({
          allocation: [0, Validators.required],
          placement: this.fb.array<string>([]),
        }),
      }),
    });
  }

  get tosArray(): FormArray {
    return this.examForm.get('tos') as FormArray;
  }

  populateForm(exam: EditExamData): void {
    // Convert datetime string to datetime-local format
    const startsAt = exam.starts_at
      ? new Date(exam.starts_at).toISOString().slice(0, 16)
      : '';
    const endsAt = exam.ends_at
      ? new Date(exam.ends_at).toISOString().slice(0, 16)
      : '';

    // Convert year numbers to strings to match form control
    const yearStrings = (exam.year || []).map((y: number | string) =>
      String(y)
    );

    this.examForm.patchValue({
      title: exam.title,
      description: exam.description,
      year: yearStrings,
      sections: exam.sections || [],
      starts_at: startsAt,
      ends_at: endsAt,
    });

    // Populate TOS with full structure
    if (exam.tos && exam.tos.length > 0) {
      const tosFormArray = this.tosArray;
      tosFormArray.clear();
      exam.tos.forEach((tosItem: TosItem) => {
        const tosGroup = this.fb.group({
          topic: [tosItem.topic || '', Validators.required],
          time_allotment: [tosItem.time_allotment || 0, Validators.required],
          no_of_items: [tosItem.no_of_items || 0],
          outcomes: this.fb.array(
            (tosItem.outcomes || []).map((outcome) => this.fb.control(outcome))
          ),
          distribution: this.fb.group({
            easy: this.fb.group({
              allocation: [
                tosItem.distribution?.easy?.allocation || 0,
                Validators.required,
              ],
              placement: this.fb.array(
                (tosItem.distribution?.easy?.placement || []).map((p: string) =>
                  this.fb.control(p)
                )
              ),
            }),
            moderate: this.fb.group({
              allocation: [
                tosItem.distribution?.moderate?.allocation || 0,
                Validators.required,
              ],
              placement: this.fb.array(
                (tosItem.distribution?.moderate?.placement || []).map(
                  (p: string) => this.fb.control(p)
                )
              ),
            }),
            difficult: this.fb.group({
              allocation: [
                tosItem.distribution?.difficult?.allocation || 0,
                Validators.required,
              ],
              placement: this.fb.array(
                (tosItem.distribution?.difficult?.placement || []).map(
                  (p: string) => this.fb.control(p)
                )
              ),
            }),
          }),
        });
        tosFormArray.push(tosGroup);
      });
    }

    // TODO: Calculate total items and update signals
  }

  onYearChange(event: any): void {
    const currentYears = this.examForm.get('year')?.value || [];
    const yearValue = (event.target as HTMLInputElement).value;

    if (event.target.checked) {
      if (!currentYears.includes(yearValue)) {
        this.examForm.patchValue({
          year: [...currentYears, yearValue],
        });
      }
    } else {
      this.examForm.patchValue({
        year: currentYears.filter((y: string) => y !== yearValue),
      });
    }
  }

  onSectionChange(event: any): void {
    const currentSections = this.examForm.get('sections')?.value || [];
    const sectionValue = (event.target as HTMLInputElement).value;

    if (event.target.checked) {
      if (!currentSections.includes(sectionValue)) {
        this.examForm.patchValue({
          sections: [...currentSections, sectionValue],
        });
      }
    } else {
      this.examForm.patchValue({
        sections: currentSections.filter((s: string) => s !== sectionValue),
      });
    }
  }

  calculateTotalItems(index: number): number {
    const tosItem = this.tosArray.at(index) as FormGroup;
    const distribution = tosItem.get('distribution') as FormGroup;
    const easy = parseInt(
      distribution.get('easy')?.get('allocation')?.value || 0
    );
    const moderate = parseInt(
      distribution.get('moderate')?.get('allocation')?.value || 0
    );
    const difficult = parseInt(
      distribution.get('difficult')?.get('allocation')?.value || 0
    );
    return easy + moderate + difficult;
  }

  updateTotalItems(index: number): void {
    const total = this.calculateTotalItems(index);
    const tosItem = this.tosArray.at(index) as FormGroup;
    tosItem.patchValue({ no_of_items: total }, { emitEvent: false });
  }

  addTosItem(): void {
    this.tosArray.push(this.createTosItem());
  }

  removeTosItem(index: number): void {
    this.tosArray.removeAt(index);
  }

  protected toggleTopicExpanded(index: number): void {
    if (this.expandedTopic() === index) {
      this.expandedTopic.set(null);
    } else {
      this.expandedTopic.set(index);
    }
  }

  protected autoCalculateDistribution(topicIndex: number): void {
    const tosArray = this.tosArray;
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

    this.recalculateTotalItems();
  }

  private recalculateTotalItems(): void {
    const total = this.tosArray.value.reduce((sum: number, topic: any) => {
      return sum + (parseInt(topic.no_of_items || 0) || 0);
    }, 0);
    this.totalItemsComputed.set(total);
  }

  // ========== OUTCOME HELPERS ==========
  protected getOutcomes(topicIndex: number): FormArray {
    return (this.tosArray.at(topicIndex) as FormGroup).get(
      'outcomes'
    ) as FormArray;
  }

  protected addOutcome(topicIndex: number): void {
    this.getOutcomes(topicIndex).push(this.fb.control(''));
  }

  protected removeOutcome(topicIndex: number, outcomeIndex: number): void {
    this.getOutcomes(topicIndex).removeAt(outcomeIndex);
  }

  // ========== PLACEMENT HELPERS ==========
  protected getPlacement(
    topicIndex: number,
    level: 'easy' | 'moderate' | 'difficult'
  ): FormArray {
    const dist = (this.tosArray.at(topicIndex) as FormGroup).get(
      'distribution'
    ) as FormGroup;
    const lvl = dist.get(level) as FormGroup;
    return lvl.get('placement') as FormArray;
  }

  protected addPlacement(
    topicIndex: number,
    level: 'easy' | 'moderate' | 'difficult'
  ): void {
    this.getPlacement(topicIndex, level).push(this.fb.control(''));
  }

  protected removePlacement(
    topicIndex: number,
    level: 'easy' | 'moderate' | 'difficult',
    placementIndex: number
  ): void {
    this.getPlacement(topicIndex, level).removeAt(placementIndex);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onSubmit(): void {
    if (this.examForm.invalid) {
      Object.keys(this.examForm.controls).forEach((key) => {
        this.examForm.get(key)?.markAsTouched();
      });
      return;
    }

    const currentExam = this.exam();
    if (!currentExam) return;

    this.saving.set(true);
    this.error.set(null);

    const rawValue = this.examForm.getRawValue();

    // Update no_of_items for each TOS item before sending
    const tosArray = rawValue.tos.map((tos: any, index: number) => ({
      ...tos,
      no_of_items: this.calculateTotalItems(index),
    }));

    const payload = {
      ...rawValue,
      tos: tosArray,
    };

    this.examApi.update(currentExam.id, payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        // Emit the updated exam data
        this.submitted.emit({
          ...currentExam,
          ...res.data,
        });
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message || 'Failed to update exam');
      },
    });
  }
}
