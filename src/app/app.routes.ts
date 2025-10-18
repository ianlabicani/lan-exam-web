import { Routes } from '@angular/router';
import { isTeacherGuard } from './teacher/guards/is-teacher-guard';
import { isStudentGuard } from './student/guards/is-student.guard';
import { teacherServices } from './teacher/services/teacher.services';
import studentProviders from './student/services/student.providers';
import { routes as studentRoutes } from './student/student.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((c) => c.Login),
  },

  {
    path: 'teacher',
    canActivate: [isTeacherGuard],
    providers: [...teacherServices],
    loadComponent: () => import('./teacher/teacher').then((c) => c.Teacher),
    loadChildren: () =>
      import('./teacher/teacher.routes').then((m) => m.routes),
  },
  ...studentRoutes,
  {
    path: 'welcome',
    loadComponent: () => import('./welcome/welcome').then((c) => c.Welcome),
  },
];
