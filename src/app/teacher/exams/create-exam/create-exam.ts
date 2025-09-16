import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircle, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ExamService } from '../../services/exam.service';

@Component({
  selector: 'app-create-exam',
  imports: [ReactiveFormsModule, FaIconComponent],
  templateUrl: './create-exam.html',
  styleUrl: './create-exam.css',
})
export class CreateExam implements OnInit {
  private fb = inject(FormBuilder);
  private examService = inject(ExamService);
  private router = inject(Router);

  faCircle = faCircle;
  faSpinner = faSpinner;
  faPlus = faPlus;
  savingSig = signal<boolean>(false);
  errorMsg: string | null = null;
  sectionOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  examForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    starts_at: [''],
    ends_at: [''],
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
  }

  create() {
    if (this.examForm.invalid || this.savingSig()) {
      this.examForm.markAllAsTouched();
      return;
    }
    this.errorMsg = null;
    this.savingSig.set(true);

    const raw = this.examForm.getRawValue();
    // Map boolean selections to their letter codes
    const selectedSections = Object.entries(
      this.sections.getRawValue() as Record<string, boolean>
    )
      .filter(([_, checked]) => !!checked)
      .map(([letter]) => letter);
    const payload = {
      title: raw.title,
      description: raw.description,
      starts_at: new Date(raw.starts_at).toISOString(),
      ends_at: new Date(raw.ends_at).toISOString(),
      year: String(raw.year),
      sections: selectedSections.join(','),
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
        this.errorMsg = err?.error?.message || 'Failed to create exam';
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
