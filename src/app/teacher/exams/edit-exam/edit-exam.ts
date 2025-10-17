import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
} from '@fortawesome/free-solid-svg-icons';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-edit-exam',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FontAwesomeModule],
  templateUrl: './edit-exam.html',
  styleUrl: './edit-exam.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditExam implements OnInit {
  http = inject(HttpClient);
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);

  // Signals
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

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

  ngOnInit(): void {
    this.initForm();
    this.loadExam();
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
      time_allotment: [0],
      no_of_items: [{ value: 0, disabled: true }],
      outcomes: [[]],
      distribution: this.fb.group({
        easy: this.fb.group({ allocation: [0] }),
        moderate: this.fb.group({ allocation: [0] }),
        difficult: this.fb.group({ allocation: [0] }),
      }),
    });
  }

  get tosArray(): FormArray {
    return this.examForm.get('tos') as FormArray;
  }

  loadExam(): void {
    const examId = this.route.snapshot.paramMap.get('examId');
    if (!examId) return;

    this.loading.set(true);
    this.http
      .get<any>(`${environment.apiBaseUrl}/teacher/exams/${examId}/edit`)
      .subscribe({
        next: (res) => {
          console.log('API Response:', res);
          // Response structure is { exam: {...} }
          const exam = res.exam;
          console.log('Exam data:', exam);
          this.populateForm(exam);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Load error:', err);
          this.error.set(err?.error?.message || 'Failed to load exam');
          this.loading.set(false);
        },
      });
  }

  populateForm(exam: any): void {
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

    // Populate TOS
    if (exam.tos && exam.tos.length > 0) {
      const tosFormArray = this.tosArray;
      tosFormArray.clear();
      exam.tos.forEach((tosItem: any) => {
        const tosGroup = this.fb.group({
          topic: [tosItem.topic || '', Validators.required],
          time_allotment: [tosItem.time_allotment || 0],
          no_of_items: [tosItem.no_of_items || 0],
          outcomes: [tosItem.outcomes || []],
          distribution: this.fb.group({
            easy: this.fb.group({
              allocation: [tosItem.distribution?.easy?.allocation || 0],
            }),
            moderate: this.fb.group({
              allocation: [tosItem.distribution?.moderate?.allocation || 0],
            }),
            difficult: this.fb.group({
              allocation: [tosItem.distribution?.difficult?.allocation || 0],
            }),
          }),
        });
        tosFormArray.push(tosGroup);
      });
    }
  }

  onYearChange(event: any): void {
    const selectedYears = this.yearOptions.filter((year) => {
      const checkbox = event.target as HTMLInputElement;
      if (checkbox.value === year) {
        return event.target.checked;
      }
      // Keep already selected years
      const currentYears = this.examForm.get('year')?.value || [];
      return currentYears.includes(year);
    });

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

  onSubmit(): void {
    if (this.examForm.invalid) {
      Object.keys(this.examForm.controls).forEach((key) => {
        this.examForm.get(key)?.markAsTouched();
      });
      return;
    }

    const examId = this.route.snapshot.paramMap.get('examId');
    if (!examId) return;

    this.saving.set(true);
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

    this.http
      .put(`${environment.apiBaseUrl}/teacher/exams/${examId}`, payload)
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/teacher/exams']);
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Failed to update exam');
          this.saving.set(false);
        },
      });
  }
}
