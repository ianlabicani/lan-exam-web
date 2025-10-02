import { ExamActivityService } from './exam-activity.service';
import { ExamService } from './exam.service';
import { StudentExamItemService } from './student-exam-item.service';
import { StudentExamService } from './student-exam.service';
import { StudentTakenExamService } from './student-taken-exam.service';

export default [
  StudentTakenExamService,
  StudentExamService,
  ExamActivityService,
  StudentExamItemService,
  ExamService,
];
