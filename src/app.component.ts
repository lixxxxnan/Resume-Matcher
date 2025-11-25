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
      this.error.set("请提供简历和职位描述（JD），每项内容至少 50 个字符。");
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
      this.error.set("分析过程中发生错误，请检查输入后重试。");
    } finally {
      this.isAnalyzing.set(false);
    }
  }
}