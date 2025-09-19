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
    path: 'taken-exams/:takenExamId',
    loadComponent: () =>
      import('./view-taken-exam/view-taken-exam').then((c) => c.ViewTakenExam),
  },
];
