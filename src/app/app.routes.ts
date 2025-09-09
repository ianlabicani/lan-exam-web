import { Routes } from '@angular/router';
import { isTeacherGuard } from './teacher/guards/is-teacher-guard';
import { isStudentGuard } from './student/guards/is-student.guard';
import { teacherServices } from './teacher/services/teacher.services';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
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
  {
    path: 'student',
    canActivate: [isStudentGuard],
    loadComponent: () => import('./student/student').then((c) => c.Student),
    loadChildren: () =>
      import('./student/student.routes').then((m) => m.routes),
  },
];
