import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'takers',
    pathMatch: 'full',
  },
  {
    path: 'takers',
    loadComponent: () =>
      import('./list-taken-exams/list-taken-exams').then(
        (c) => c.ListTakenExams
      ),
  },
  {
    path: 'takers/:examTakerId',
    loadComponent: () =>
      import('./view-taken-exam/view-taken-exam').then((c) => c.ViewTakenExam),
  },
];
