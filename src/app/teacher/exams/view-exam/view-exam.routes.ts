import { Routes } from '@angular/router';

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
  {
    path: 'takers',
    loadComponent: () =>
      import('./list-exam-takers/list-exam-takers').then(
        (c) => c.ListExamTakers
      ),
  },
];
