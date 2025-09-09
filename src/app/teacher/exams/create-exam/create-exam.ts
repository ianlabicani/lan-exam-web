import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExamsService } from '../exams.service';
import { Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircle, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-create-exam',
  imports: [ReactiveFormsModule, FaIconComponent],
  templateUrl: './create-exam.html',
  styleUrl: './create-exam.css',
})
export class CreateExam {
  private fb = inject(FormBuilder);
  private examService = inject(ExamsService);
  private router = inject(Router);

  faCircle = faCircle;
  faSpinner = faSpinner;
  faPlus = faPlus;
  savingSig = signal<boolean>(false);
  errorMsg: string | null = null;

  examForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    startsAt: [''],
    endsAt: [''],
    year: [1 as 1 | 2 | 3 | 4, Validators.required],
    section: [
      'a' as 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g',
      Validators.required,
    ],
    status: 'draft' as 'draft' | 'published' | 'archived',
  });

  create() {
    if (this.examForm.invalid || this.savingSig()) {
      this.examForm.markAllAsTouched();
      return;
    }
    this.errorMsg = null;
    this.savingSig.set(true);

    const raw = this.examForm.getRawValue();
    const payload = {
      title: raw.title,
      description: raw.description,
      starts_at: new Date(raw.startsAt).toISOString(),
      ends_at: new Date(raw.endsAt).toISOString(),
      year: String(raw.year),
      section: String(raw.section),
      status: raw.status,
      total_points: 0,
    };

    this.examService.createExam(payload).subscribe({
      next: (res) => {
        this.savingSig.set(false);

        this.router.navigate(['/teacher/exams/view-exam/', res.exam.id]);
      },
      error: (err) => {
        this.savingSig.set(false);
        this.errorMsg = err?.error?.message || 'Failed to create exam';
      },
    });
  }
}
