import { Routes } from '@angular/router';
import { examsRoute } from './exams/exams.routes';
import { gradingRoutes } from './grading/grading.routes';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard').then((c) => c.Dashboard),
  },
  {
    path: 'grading',
    children: gradingRoutes,
  },
  ...examsRoute,
];
