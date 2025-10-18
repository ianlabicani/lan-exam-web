import { Injectable } from '@angular/core';

export interface Exam {
  id: number;
  title: string;
  description: string;
  starts_at: string | Date;
  ends_at: string | Date;
  year: string;
  section?: string;
  sections?: string[];
  status: 'draft' | 'published' | 'active' | 'archived';
  total_points: number;
  items?: ExamItem[];
  tos?: TosTopic[];
  created_at: string | Date;
  updated_at: string | Date;
}

export interface ExamItem {
  id: number;
  exam_id: number;
  type:
    | 'mcq'
    | 'essay'
    | 'true_false'
    | 'short_answer'
    | 'matching'
    | 'fill_blank';
  question: string;
  points: number;
  order: number;
  data: Record<string, any>;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface TakenExam {
  id: number;
  exam_id: number;
  student_id: number;
  student: { id: number; name: string; email: string };
  started_at: string | Date;
  submitted_at?: string | Date;
  score?: number;
  is_graded: boolean;
  answers: StudentAnswer[];
  created_at: string | Date;
  updated_at: string | Date;
}

export interface StudentAnswer {
  id: number;
  item_id: number;
  taken_exam_id: number;
  answer: string | Record<string, any>;
  is_correct?: boolean;
  score?: number;
  feedback?: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface ExamAnalytics {
  exam_id: number;
  total_attempts: number;
  avg_score: number;
  completion_rate: number;
  avg_time_on_exam: number;
  per_question_stats: Array<{
    item_id: number;
    question: string;
    percent_correct: number;
    difficulty_level: 'easy' | 'medium' | 'hard';
  }>;
  score_distribution: Record<string, number>;
}

export interface ActivityLog {
  id: number;
  taken_exam_id: number;
  event_type: 'tab_switch' | 'focus_lost' | 'idle' | 'page_visibility_change';
  timestamp: string | Date;
  metadata: Record<string, any>;
}

export interface TosTopic {
  topic: string;
  outcomes: string[];
  time_allotment: number;
  no_of_items: number;
  distribution: TosDistribution;
}

export interface TosDistribution {
  easy: TosDistributionLevel;
  moderate: TosDistributionLevel;
  difficult: TosDistributionLevel;
}

export interface TosDistributionLevel {
  allocation: number;
  placement: string[];
}
