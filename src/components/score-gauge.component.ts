import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-gauge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-40 h-40 flex items-center justify-center">
      <!-- Background Circle -->
      <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#e2e8f0"
          stroke-width="10"
        />
        <!-- Progress Circle -->
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          [attr.stroke]="color()"
          stroke-width="10"
          stroke-dasharray="283"
          [attr.stroke-dashoffset]="dashOffset()"
          stroke-linecap="round"
          class="transition-all duration-1000 ease-out"
        />
      </svg>
      
      <!-- Text -->
      <div class="absolute flex flex-col items-center">
        <span class="text-4xl font-bold text-slate-800">{{ score() }}</span>
        <span class="text-xs uppercase tracking-wider text-slate-500 font-semibold">匹配度</span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScoreGaugeComponent {
  score = input.required<number>();

  dashOffset = computed(() => {
    const circumference = 283; // 2 * pi * 45
    const progress = this.score() / 100;
    return circumference * (1 - progress);
  });

  color = computed(() => {
    const s = this.score();
    if (s >= 80) return '#22c55e'; // Green
    if (s >= 60) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  });
}