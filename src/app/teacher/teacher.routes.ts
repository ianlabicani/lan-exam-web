import { Routes } from '@angular/router';
import { examsRoute } from './exams/exams.routes';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard').then((c) => c.Dashboard),
  },
  ...examsRoute,
];
