export interface Exam {
  id: number;
  title: string;
  description: string;
  starts_at: Date;
  ends_at: Date;
  year: string;
  sections: string[];
  status: string;
  total_points: number;
  tos: To[];
  created_at: Date;
  updated_at: Date;
  taken_exam: TakenExam | null;
}

export interface TakenExam {
  id: number;
  exam_id: number;
  type: string;
  user_id: number;
  started_at: Date;
  submitted_at: Date | null;
  total_points: number;
  status: string;
  created_at: Date;
  updated_at: Date;
  answers: any;
  exam: Exam | null;
}

export interface To {
  topic: string;
  outcomes: string[];
  time_allotment: number;
  no_of_items: number;
  distribution: Distribution;
}

export interface Distribution {
  easy: Difficult;
  moderate: Difficult;
  difficult: Difficult;
}

export interface Difficult {
  allocation: number;
  placement: string[];
}
