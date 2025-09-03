import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard').then((c) => c.Dashboard),
  },
  {
    path: 'exams',
    loadComponent: () => import('./exams/exams').then((c) => c.Exams),
  },
  {
    path: 'take-exam/:examId',
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
