import { Routes } from '@angular/router';
import { routes as takenExamsRoutes } from './exams/taken-exams/taken-exams.routes';
import { isStudentGuard } from './guards/is-student.guard';
import studentProviders from './services/student.providers';

export const routes: Routes = [
  {
    path: 'student',
    canActivate: [isStudentGuard],
    providers: [studentProviders],
    loadComponent: () => import('./student').then((c) => c.Student),
    children: [
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
    ],
  },
];
