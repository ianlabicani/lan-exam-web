import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  input,
} from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamsService, IExam } from '../exams.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-view-exam',
  imports: [RouterLink, DatePipe, UpperCasePipe, FormsModule, RouterOutlet],
  templateUrl: './view-exam.html',
  styleUrl: './view-exam.css',
})
export class ViewExam implements OnInit {
  examId = input.required<number>(); // from route param

  private http = inject(HttpClient);

  examSig = signal<IExam | null | undefined>(undefined);
  loadingSig = signal(true);
  errorMsg = signal<string | null>(null);
  isEditable = computed(() => this.examSig()?.status === 'draft');

  ngOnInit(): void {
    this.getExam(this.examId());
  }

  private getExam(id: number) {
    this.loadingSig.set(true);
    this.http
      .get<IExam | null>(`${environment.apiBaseUrl}/teacher/exams/${id}`)
      .subscribe({
        next: (exam) => {
          this.loadingSig.set(false);

          if (!exam) {
            this.errorMsg.set('Exam not found');
            this.examSig.set(undefined);
            return;
          }

          this.examSig.set(exam);
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Failed to load exam');
          this.loadingSig.set(false);
          this.examSig.set(undefined);
        },
      });
  }

  statusBadge(status?: string) {
    const map: Record<string, string> = {
      active: 'bg-blue-100 text-blue-700',
      published: 'bg-green-100 text-green-700',
      draft: 'bg-gray-100 text-gray-700',
      archived: 'bg-yellow-100 text-yellow-700',
    };
    return status
      ? map[status] || 'bg-gray-100 text-gray-700'
      : 'bg-gray-100 text-gray-700';
  }
}
