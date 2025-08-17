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
];
