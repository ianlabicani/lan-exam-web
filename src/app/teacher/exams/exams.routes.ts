import { Routes } from '@angular/router';

export const examsRoute: Routes = [
  {
    path: 'exams',
    loadComponent: () =>
      import('./list-exams/list-exams').then((c) => c.ListExams),
  },
  {
    path: 'exams/create',
    loadComponent: () =>
      import('./create-exam/create-exam').then((c) => c.CreateExam),
  },
  {
    path: 'exams/:examId',
    loadComponent: () =>
      import('./view-exam/view-exam').then((c) => c.ViewExam),
    loadChildren: () =>
      import('./view-exam/view-exam.routes').then((c) => c.routes),
  },
];
