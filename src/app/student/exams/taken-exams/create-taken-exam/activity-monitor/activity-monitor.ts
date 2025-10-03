import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ActivityEvent {
  event_type: string;
  details?: string;
  created_at?: Date | string;
}

export interface ActivitySummary {
  totalEvents: number;
  tabSwitches: number;
  windowSwitches: number;
  questionsAnswered: number;
  lastActivity?: Date | string;
}

@Component({
  selector: 'app-activity-monitor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-monitor.html',
  styleUrl: './activity-monitor.css',
})
export class ActivityMonitor {
  events = input.required<ActivityEvent[]>();
  summary = input.required<ActivitySummary>();
  isOpen = input.required<boolean>();

  togglePanel = output<void>();

  activityTrend = computed(() => {
    const events = this.events();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    const recentWarnings = events.filter((e) => {
      const eventTime = new Date(e.created_at!).getTime();
      return (
        eventTime > fiveMinutesAgo &&
        this.getEventSeverity(e.event_type) === 'warning'
      );
    }).length;

    return recentWarnings > 3 ? 'moderate' : 'active';
  });

  sessionDuration = computed(() => {
    const startEvent = this.events().find(
      (e) => e.event_type === 'exam_session_started'
    );
    if (!startEvent?.created_at) return '0 minutes';

    const diffMinutes = Math.floor(
      (Date.now() - new Date(startEvent.created_at).getTime()) / 60000
    );

    if (diffMinutes < 60) return `${diffMinutes} minutes`;

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  });

  getEventTypeDisplay(eventType: string): string {
    const eventTypeMap: Record<string, string> = {
      exam_session_started: '🎯 Exam Started',
      exam_session_ended: '✅ Exam Ended',
      exam_submitted: '📤 Exam Submitted',
      exam_auto_submitted: '⏰ Auto-Submitted (Time Expired)',
      tab_hidden: '👁️ Tab Hidden',
      tab_visible: '👁️ Tab Visible',
      window_blur: '🔄 Window Lost Focus',
      window_focus: '🔄 Window Gained Focus',
      exam_page_loaded: '📄 Exam Page Loaded',
      previous_answers_loaded: '📄 Previous Answers Loaded',
    };
    return eventTypeMap[eventType] || `📝 ${eventType}`;
  }

  getEventSeverity(eventType: string): 'normal' | 'warning' | 'danger' {
    if (eventType.includes('tab_hidden') || eventType.includes('window_blur')) {
      return 'warning';
    }
    return 'normal';
  }

  onToggle(): void {
    this.togglePanel.emit();
  }
}
