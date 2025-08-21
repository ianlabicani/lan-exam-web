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
    path: 'exams/create-exam',
    loadComponent: () =>
      import('./exams/create-exam/create-exam').then((c) => c.CreateExam),
  },
  {
    path: 'exams/view-exam/:id',
    loadComponent: () =>
      import('./exams/view-exam/view-exam').then((c) => c.ViewExam),
  },
  {
    path: 'exams/view-exam/:id/takers',
    loadComponent: () =>
      import('./exams/view-exam/exam-takers/exam-takers').then(
        (c) => c.ExamTakers
      ),
  },
];
