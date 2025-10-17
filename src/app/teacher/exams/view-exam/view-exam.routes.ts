import { Routes } from '@angular/router';
import { routes as examTakerRoutes } from './taken-exams/taken-exams.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full',
  },
  {
    path: 'overview',
    loadComponent: () => import('./overview/overview').then((c) => c.Overview),
  },
  {
    path: 'items',
    loadComponent: () =>
      import('./list-exam-items/list-exam-items').then((c) => c.ListExamItems),
  },
  {
    path: 'takers',
    loadComponent: () =>
      import('./taken-exams/list-taken-exams/list-taken-exams').then(
        (c) => c.ListTakenExams
      ),
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./analytics/analytics').then((c) => c.AnalyticsComponent),
  },
  ...examTakerRoutes,
];
