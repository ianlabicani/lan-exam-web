import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard').then((c) => c.Dashboard),
  },
  {
    path: 'exams',
    loadComponent: () =>
      import('./exams/list-exams/list-exams').then((c) => c.ListExams),
  },
  {
    path: 'taken-exams/:takenExamId',
    loadComponent: () =>
      import('./exams/take-exam/take-exam').then((c) => c.TakeExam),
  },
  {
    path: 'taken-exam/:takenExamId',
    loadComponent: () =>
      import('./taken-exams/taken-exam-detail/taken-exam-detail').then(
        (c) => c.TakenExamDetail
      ),
  },
];
