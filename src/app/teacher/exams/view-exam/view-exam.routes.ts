import { Routes } from '@angular/router';
import { routes as examTakerRoutes } from './taken-exams/taken-exams.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'items',
    pathMatch: 'full',
  },
  {
    path: 'items',
    loadComponent: () =>
      import('./list-exam-items/list-exam-items').then((c) => c.ListExamItems),
  },
  ...examTakerRoutes,
];
