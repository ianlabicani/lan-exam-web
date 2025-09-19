import { RouterLink } from '@angular/router';
import { StudentTakenExamService } from './../../../services/student-taken-exam.service';
import { Component, inject, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-list-taken-exams',
  imports: [RouterLink],
  templateUrl: './list-taken-exams.html',
  styleUrl: './list-taken-exams.css',
})
export class ListTakenExams implements OnInit {
  studentTakenExamService = inject(StudentTakenExamService);
  takenExams = signal<any[]>([]);

  ngOnInit(): void {
    this.studentTakenExamService.getAll().subscribe({
      next: (res) => {
        this.takenExams.set(res.data || []);
      },
    });
  }
}
