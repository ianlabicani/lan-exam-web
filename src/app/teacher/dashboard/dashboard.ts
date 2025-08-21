import { Component, signal, computed } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-teacher-dashboard',
  imports: [DatePipe, NgClass, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  // Mock data
  exams = signal([
    {
      id: 'e1',
      title: 'Midterm Algebra',
      status: 'active',
      submissions: 24,
      totalStudents: 30,
      startsAt: new Date(Date.now() - 3600_000),
      endsAt: new Date(Date.now() + 2 * 3600_000),
    },
    {
      id: 'e2',
      title: 'Chemistry Quiz 1',
      status: 'published',
      submissions: 5,
      totalStudents: 28,
      startsAt: new Date(Date.now() + 24 * 3600_000),
      endsAt: new Date(Date.now() + 25 * 3600_000),
    },
    {
      id: 'e3',
      title: 'History Practice Set',
      status: 'archived',
      submissions: 30,
      totalStudents: 30,
      startsAt: new Date(Date.now() - 7 * 24 * 3600_000),
      endsAt: new Date(Date.now() - 7 * 24 * 3600_000 + 3600_000),
    },
    {
      id: 'e4',
      title: 'Final Project Defense',
      status: 'draft',
      submissions: 0,
      totalStudents: 30,
      startsAt: null,
      endsAt: null,
    },
  ]);

  recentActivity = signal([
    {
      id: 'a1',
      type: 'submission',
      exam: 'Midterm Algebra',
      student: 'Alice B.',
      time: new Date(Date.now() - 15 * 60_000),
    },
    {
      id: 'a2',
      type: 'submission',
      exam: 'Midterm Algebra',
      student: 'Carlos D.',
      time: new Date(Date.now() - 35 * 60_000),
    },
    {
      id: 'a3',
      type: 'published',
      exam: 'Chemistry Quiz 1',
      student: null,
      time: new Date(Date.now() - 2 * 3600_000),
    },
    {
      id: 'a4',
      type: 'graded',
      exam: 'History Practice Set',
      student: 'Emily R.',
      time: new Date(Date.now() - 5 * 3600_000),
    },
  ]);

  // Derived stats
  totalExams = computed(() => this.exams().length);
  activeExams = computed(
    () => this.exams().filter((e) => e.status === 'active').length
  );
  draftExams = computed(
    () => this.exams().filter((e) => e.status === 'draft').length
  );
  publishedExams = computed(
    () => this.exams().filter((e) => e.status === 'published').length
  );
  completionRate = computed(() => {
    const publishedOrActive = this.exams().filter((e) =>
      ['active', 'published', 'archived'].includes(e.status)
    );
    if (!publishedOrActive.length) return 0;
    const ratios = publishedOrActive.map(
      (e) => e.submissions / (e.totalStudents || 1)
    );
    return Math.round(
      (ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100
    );
  });

  statusBadge(status: string) {
    const map: Record<string, string> = {
      active: 'bg-blue-100 text-blue-700',
      published: 'bg-green-100 text-green-700',
      draft: 'bg-gray-100 text-gray-700',
      archived: 'bg-yellow-100 text-yellow-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  }

  activityIcon(type: string) {
    switch (type) {
      case 'submission':
        return {
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          icon: 'M9 12h6m-6 4h6M5 8h14',
        };
      case 'published':
        return {
          color: 'text-green-600',
          bg: 'bg-green-50',
          icon: 'M5 13l4 4L19 7',
        };
      case 'graded':
        return {
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          icon: 'M9 17v-6h6v6m2 4H7',
        };
      default:
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          icon: 'M4 6h16M4 12h16M4 18h16',
        };
    }
  }

  progressPercent(exam: any) {
    if (!exam.totalStudents) return 0;
    return Math.round((exam.submissions / exam.totalStudents) * 100);
  }
}
