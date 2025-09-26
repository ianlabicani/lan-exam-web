import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'taken-exams',
    loadComponent: () =>
      import('./list-taken-exams/list-taken-exams').then(
        (c) => c.ListTakenExams
      ),
  },
  {
    path: 'taken-exams/create',
    loadComponent: () =>
      import('./create-taken-exam/create-taken-exam').then(
        (c) => c.CreateTakenExam
      ),
  },
  {
    path: 'taken-exams/:takenExamId/continue',
    loadComponent: () =>
      import('./create-taken-exam/create-taken-exam').then(
        (c) => c.CreateTakenExam
      ),
  },
  {
    path: 'taken-exams/:takenExamId',
    loadComponent: () =>
      import('./view-taken-exam/view-taken-exam').then((c) => c.ViewTakenExam),
  },
];
