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
      你是一位拥有 10 年经验的资深 HR 和技术招聘专家。
      
      任务：请深度分析以下【简历内容】与【职位描述 (JD)】的匹配程度。
      
      简历内容：
      ${resumeText}
      
      职位描述 (JD)：
      ${jdText}
      
      请提供一个严格的 JSON 格式回复。
      **重要**：所有返回的文本字段（summary, strengths, recommendations 等）必须使用**中文**撰写。
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
              description: "匹配度评分 (0-100)。"
            },
            summary: {
              type: Type.STRING,
              description: "关于匹配情况的简要中文综述。"
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "简历中与 JD 高度匹配的技能或经验亮点 (中文)。"
            },
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "JD 中要求但简历中缺失的关键技能或关键词 (中文)。"
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "类别，例如：格式、技能、经验、关键词" },
                  suggestion: { type: Type.STRING, description: "具体的改进建议 (中文)。" },
                  example: { type: Type.STRING, description: "具体的修改示例 (中文)。" }
                }
              },
              description: "针对此职位提升简历匹配度的具体建议。"
            }
          },
          required: ["score", "summary", "strengths", "missingSkills", "recommendations"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("AI 未返回数据");
    }

    try {
      return JSON.parse(jsonText) as AnalysisResult;
    } catch (e) {
      console.error("解析 AI 响应失败", e);
      throw new Error("无法解析分析结果。");
    }
  }
}