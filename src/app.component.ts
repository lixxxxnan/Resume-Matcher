import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { GeminiService, AnalysisResult } from './services/gemini.service';
import { ScoreGaugeComponent } from './components/score-gauge.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ScoreGaugeComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  resumeControl = new FormControl('');
  jdControl = new FormControl('');
  
  isAnalyzing = signal(false);
  result = signal<AnalysisResult | null>(null);
  error = signal<string | null>(null);

  constructor(private geminiService: GeminiService) {}

  isValidInput(): boolean {
    const r = this.resumeControl.value?.trim();
    const j = this.jdControl.value?.trim();
    return !!(r && j && r.length > 50 && j.length > 50);
  }

  async analyze() {
    this.error.set(null);
    this.result.set(null);
    
    if (!this.isValidInput()) {
      this.error.set("Please provide both a Resume and Job Description (at least 50 characters each).");
      return;
    }

    this.isAnalyzing.set(true);

    try {
      const resumeText = this.resumeControl.value!;
      const jdText = this.jdControl.value!;
      
      const analysis = await this.geminiService.analyzeResume(resumeText, jdText);
      this.result.set(analysis);
    } catch (err: unknown) {
      console.error(err);
      this.error.set("An error occurred while analyzing. Please check your inputs and try again.");
    } finally {
      this.isAnalyzing.set(false);
    }
  }
}