import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
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
import { CreateExamService } from './create-exam.service';

@Component({
  selector: 'app-create-exam',
  imports: [ReactiveFormsModule, FaIconComponent, CommonModule],
  templateUrl: './create-exam.html',
  styleUrl: './create-exam.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateExam implements OnInit {
  private createExamSvc = inject(CreateExamService);
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

  // Expose service state to template
  savingSig = this.createExamSvc.saving;
  errorMsg = this.createExamSvc.errorMsg;
  durationDisplay = this.createExamSvc.durationDisplay;
  totalItemsComputed = this.createExamSvc.totalItemsComputed;
  expandedTopic = this.createExamSvc.expandedTopic;

  sectionOptions = this.createExamSvc.sectionOptions;
  yearOptions = this.createExamSvc.yearOptions;

  examForm: FormGroup = this.createExamSvc.createExamForm();

  ngOnInit(): void {
    // Initialize sections
    const sectionsGroup = this.sections;
    this.createExamSvc.initializeSections(sectionsGroup);

    // Add initial topic
    this.createExamSvc.addTopic(this.tos);

    // Watch for changes in start/end times
    this.examForm.get('starts_at')?.valueChanges.subscribe(() => {
      this.updateDuration();
    });
    this.examForm.get('ends_at')?.valueChanges.subscribe(() => {
      this.updateDuration();
    });

    // Watch for changes in TOS
    this.tos.statusChanges.subscribe(() => {
      this.createExamSvc.recalculateTotalItems(this.tos);
    });
  }

  private updateDuration(): void {
    const startsAt = this.examForm.get('starts_at')?.value;
    const endsAt = this.examForm.get('ends_at')?.value;
    this.createExamSvc.calculateDuration(startsAt, endsAt);
  }

  /**
   * Auto-calculate distribution based on time allotment.
   */
  protected autoCalculateDistribution(topicIndex: number): void {
    this.createExamSvc.autoCalculateDistribution(this.examForm, topicIndex);
  }

  /**
   * Toggle topic expansion for mobile/compact view.
   */
  protected toggleTopicExpanded(index: number): void {
    this.createExamSvc.toggleTopicExpanded(index);
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
      year: yearArray,
      sections: selectedSections,
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

    this.createExamSvc.createExam(payload).subscribe({
      next: (res: any) => {
        this.savingSig.set(false);
        this.router.navigate(['/teacher/exams/', res.data.id]);
      },
      error: (err: any) => {
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
  addTopic(topicName: string = '') {
    this.createExamSvc.addTopic(this.tos, topicName);
  }

  removeTopic(index: number) {
    this.createExamSvc.removeTopic(this.tos, index);
  }

  // Outcomes helpers
  getOutcomes(topicIndex: number): FormArray {
    return this.createExamSvc.getOutcomes(this.tos, topicIndex);
  }

  addOutcome(topicIndex: number) {
    this.createExamSvc.addOutcome(this.tos, topicIndex);
  }

  removeOutcome(topicIndex: number, outcomeIndex: number) {
    this.createExamSvc.removeOutcome(this.tos, topicIndex, outcomeIndex);
  }

  // Placement helpers for distribution levels
  getPlacement(
    topicIndex: number,
    level: 'easy' | 'moderate' | 'difficult'
  ): FormArray {
    return this.createExamSvc.getPlacement(this.tos, topicIndex, level);
  }

  addPlacement(topicIndex: number, level: 'easy' | 'moderate' | 'difficult') {
    this.createExamSvc.addPlacement(this.tos, topicIndex, level);
  }

  removePlacement(
    topicIndex: number,
    level: 'easy' | 'moderate' | 'difficult',
    placementIndex: number
  ) {
    this.createExamSvc.removePlacement(
      this.tos,
      topicIndex,
      level,
      placementIndex
    );
  }

  // ========== SECTION HELPERS ==========
  addSection(section: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G') {
    if (!this.sections.get(section)) {
      const fb = inject(FormBuilder);
      this.sections.addControl(section, fb.control(false));
    }
  }

  removeSection(section: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G') {
    if (this.sections.get(section)) {
      this.sections.removeControl(section);
    }
  }
}
