import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../auth/services/auth';

export const isStudentGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const currentUser = auth.currentUser();

  if (!currentUser || currentUser.role !== 'student') {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
