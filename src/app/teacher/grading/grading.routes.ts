import { Routes } from '@angular/router';
import { GradingList } from './list-grading/list-grading';
import { GradingDetailComponent } from './grading-detail/grading-detail';

export const gradingRoutes: Routes = [
  {
    path: '',
    component: GradingList,
  },
  {
    path: ':takenExamId',
    component: GradingDetailComponent,
  },
];
