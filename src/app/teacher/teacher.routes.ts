import { Routes } from '@angular/router';
import { examsRoute } from './exams/exams.routes';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard').then((c) => c.Dashboard),
  },
  ...examsRoute,

  {
    path: 'exams/:examId/takers',
    loadComponent: () =>
      import('./exams/view-exam/view-exam-takers/view-exam-takers').then(
        (c) => c.ViewExamTakers
      ),
  },
];
