import { ExamActivityLogService } from './exam-activity-log.service';
import { ExamService } from './exam.service';
import { StudentExamItemService } from './student-exam-item.service';
import { TakenExamService } from './taken-exam.service';

export default [
  ExamActivityLogService,
  StudentExamItemService,
  ExamService,
  TakenExamService,
];
