import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BaseItem {
  id: string;
  examId?: string; // will be assigned at finalize when normalized
  type: 'mcq' | 'truefalse' | 'essay';
  question: string;
  points: number;
}

interface McqItem extends BaseItem {
  type: 'mcq';
  options: { text: string; correct: boolean }[];
}

interface TrueFalseItem extends BaseItem {
  type: 'truefalse';
  answer: boolean;
}

interface EssayItem extends BaseItem {
  type: 'essay';
  expectedAnswer?: string;
}

type ExamItem = McqItem | TrueFalseItem | EssayItem;

@Component({
  selector: 'app-create-exam',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-exam.html',
  styleUrl: './create-exam.css',
})
export class CreateExam {
  private fb = inject(FormBuilder);
  step = 1; // 1 = details, 2 = items, 3 = review

  examForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    startsAt: [''],
    endsAt: [''],
    year: [1 as 1 | 2 | 3 | 4, Validators.required],
    section: [
      'a' as 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g',
      Validators.required,
    ],
    status: 'draft' as 'draft' | 'published' | 'archived',
  });

  items: ExamItem[] = [];

  // Temporary holders for creating items
  mcqQuestion = '';
  mcqOptions: { text: string; correct: boolean }[] = [
    { text: '', correct: false },
    { text: '', correct: false },
    { text: '', correct: false },
    { text: '', correct: false },
  ];
  mcqPoints = 1;

  tfQuestion = '';
  tfAnswer: 'true' | 'false' = 'true';
  tfPoints = 1;

  essayQuestion = '';
  essayExpectedAnswer = '';
  essayPoints = 5;

  next() {
    if (this.step === 1) {
      if (this.examForm.invalid) {
        this.examForm.markAllAsTouched();
        return;
      }
    }
    if (this.step < 3) this.step++;
  }

  back() {
    if (this.step > 1) this.step--;
  }

  addMcq() {
    const options = this.mcqOptions.filter((o) => o.text.trim().length > 0);
    if (
      !this.mcqQuestion.trim() ||
      options.length < 2 ||
      !options.some((o) => o.correct)
    )
      return;
    const item: McqItem = {
      id: crypto.randomUUID(),
      type: 'mcq',
      question: this.mcqQuestion.trim(),
      options: options.map((o) => ({ ...o })),
      points: this.mcqPoints || 1,
    };
    this.items.push(item);
    this.resetMcq();
  }

  private resetMcq() {
    this.mcqQuestion = '';
    this.mcqOptions = [
      { text: '', correct: false },
      { text: '', correct: false },
      { text: '', correct: false },
      { text: '', correct: false },
    ];
    this.mcqPoints = 1;
  }

  addTrueFalse() {
    if (!this.tfQuestion.trim()) return;
    const item: TrueFalseItem = {
      id: crypto.randomUUID(),
      type: 'truefalse',
      question: this.tfQuestion.trim(),
      answer: this.tfAnswer === 'true',
      points: this.tfPoints || 1,
    };
    this.items.push(item);
    this.tfQuestion = '';
    this.tfAnswer = 'true';
    this.tfPoints = 1;
  }

  addEssay() {
    if (!this.essayQuestion.trim()) return;
    const item: EssayItem = {
      id: crypto.randomUUID(),
      type: 'essay',
      question: this.essayQuestion.trim(),
      expectedAnswer: this.essayExpectedAnswer.trim() || undefined,
      points: this.essayPoints || 5,
    };
    this.items.push(item);
    this.essayQuestion = '';
    this.essayExpectedAnswer = '';
    this.essayPoints = 5;
  }

  removeItem(id: string) {
    this.items = this.items.filter((i) => i.id !== id);
  }

  totalPoints(): number {
    return this.items.reduce((sum, i) => sum + (i.points || 0), 0);
  }

  finalize() {
    if (this.items.length === 0) return; // need at least one item
    const examId = crypto.randomUUID();
    const raw = this.examForm.getRawValue();
    const newExam = {
      id: examId,
      ...raw,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalPoints: this.totalPoints(),
    };

    // Persist exams (without items)
    const exams = localStorage.getItem('exams');
    const examsArray = exams ? JSON.parse(exams) : [];
    examsArray.push(newExam);
    localStorage.setItem('exams', JSON.stringify(examsArray));

    // Persist items separately, add examId to each
    const existingItems = JSON.parse(localStorage.getItem('examItems') || '[]');
    const itemsToStore = this.items.map((i) => ({ ...i, examId }));
    localStorage.setItem(
      'examItems',
      JSON.stringify([...existingItems, ...itemsToStore])
    );

    // Reset wizard
    this.examForm.reset({
      title: '',
      description: '',
      startsAt: '',
      endsAt: '',
      status: 'draft',
    });
    this.items = [];
    this.step = 1;
    console.log('Exam created', newExam);
  }
}
