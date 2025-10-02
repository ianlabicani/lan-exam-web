export interface TakenExam {
  id: number;
  exam_id: number;
  type: string;
  user_id: number;
  started_at: Date;
  submitted_at: Date;
  total_points: number;
  created_at: Date;
  updated_at: Date;
}
