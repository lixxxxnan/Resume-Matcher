import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";

export interface OptimizationSuggestion {
  category: string;
  suggestion: string;
  example: string;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  missingSkills: string[];
  recommendations: OptimizationSuggestion[];
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  async analyzeResume(resumeText: string, jdText: string): Promise<AnalysisResult> {
    const prompt = `
      You are an expert HR and Resume Screener.
      
      Task: Analyze the following Resume against the Job Description (JD).
      
      Resume Content:
      ${resumeText}
      
      Job Description Content:
      ${jdText}
      
      Provide a strict JSON response assessing the fit.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "A matching score from 0 to 100."
            },
            summary: {
              type: Type.STRING,
              description: "A concise executive summary of the match."
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of matching skills and experiences found in the resume."
            },
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Critical skills or keywords from the JD missing in the resume."
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "E.g., Formatting, Skills, Experience, Keywords" },
                  suggestion: { type: Type.STRING, description: "Specific advice on what to improve." },
                  example: { type: Type.STRING, description: "A concrete example of how to write it better." }
                }
              },
              description: "Actionable advice to improve the resume for this specific JD."
            }
          },
          required: ["score", "summary", "strengths", "missingSkills", "recommendations"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from AI");
    }

    try {
      return JSON.parse(jsonText) as AnalysisResult;
    } catch (e) {
      console.error("Failed to parse AI response", e);
      throw new Error("Failed to parse analysis results.");
    }
  }
}