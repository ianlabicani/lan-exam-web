import {
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ExamTimerData {
  startedAt: Date;
  endsAt: Date;
  submittedAt?: Date | null;
}

@Component({
  selector: 'app-exam-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-timer.html',
  styleUrl: './exam-timer.css',
})
export class ExamTimer implements OnInit, OnDestroy {
  examData = input.required<ExamTimerData>();
  timeExpired = output<void>();

  private currentTime = signal(new Date());
  private countdownInterval?: number;
  private hasExpired = false;

  timeRemaining = computed(() => {
    const data = this.examData();
    if (!data || data.submittedAt) return 0;

    const now = this.currentTime();
    const endTime = new Date(data.endsAt);
    const diffMs = endTime.getTime() - now.getTime();

    if (diffMs <= 0) return 0;
    return Math.floor(diffMs / 1000);
  });

  timeRemainingDisplay = computed(() => {
    const seconds = this.timeRemaining();
    if (seconds <= 0) return 'Time expired';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  });

  timeProgressPercentage = computed(() => {
    const seconds = this.timeRemaining();
    const data = this.examData();

    if (!data) return 0;

    const studentStartTime = new Date(data.startedAt);
    const endTime = new Date(data.endsAt);
    const totalDurationSeconds = Math.floor(
      (endTime.getTime() - studentStartTime.getTime()) / 1000
    );

    if (totalDurationSeconds <= 0 || seconds <= 0)
      return seconds <= 0 ? 100 : 0;

    const elapsedSeconds = totalDurationSeconds - seconds;
    const percentage = (elapsedSeconds / totalDurationSeconds) * 100;

    return Math.max(0, Math.min(100, percentage));
  });

  progressColorState = computed(() => {
    const percentage = this.timeProgressPercentage();
    if (percentage < 50) return 'green';
    if (percentage < 80) return 'amber';
    return 'red';
  });

  ngOnInit(): void {
    if (!this.examData().submittedAt) {
      this.countdownInterval = window.setInterval(() => {
        this.currentTime.set(new Date());

        // Check if time has expired and emit event once
        if (this.timeRemaining() <= 0 && !this.hasExpired) {
          this.hasExpired = true;
          this.timeExpired.emit();
        }
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
