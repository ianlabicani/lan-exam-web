import { Routes } from '@angular/router';
import { routes as takenExamsRoutes } from './exams/taken-exams/taken-exams.routes';

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
  ...takenExamsRoutes,
];
