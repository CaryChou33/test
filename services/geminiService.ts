
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Question, QuestionType } from "../types";

export const generateQuizQuestions = async (difficulty: Difficulty): Promise<Question[]> => {
  // Fix: Create a new GoogleGenAI instance inside the function to ensure up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    作为一名专业的网约车驾驶员安全培训导师，请根据以下法律法规及内容生成一套完整的考核试卷：
    1. 《网络预约出租汽车经营服务管理暂行办法》
    2. 《道路交通安全法》
    3. 安全驾驶常识
    4. 优质服务规范

    试卷难度级别：${difficulty}。
    
    试题要求：
    - 10道单项选择题 (SINGLE)
    - 10道多项选择题 (MULTIPLE)
    - 5道判断题 (BOOLEAN)
    
    难度说明：
    - 初级：侧重基础交通标志、礼仪、核心法规条文。
    - 中级：侧重复杂交通场景处理、法规细节条文、突发状况应对。
    - 高级：侧重深层法规逻辑、事故法律责任判定、极端情况避险策略。

    请严格按照指定的JSON格式返回，不要有任何多余的文字。
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            type: { 
              type: Type.STRING,
              description: 'The type of the question, must be one of: SINGLE, MULTIPLE, BOOLEAN.'
            },
            content: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswers: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanation: { type: Type.STRING }
          },
          required: ['id', 'type', 'content', 'options', 'correctAnswers', 'explanation'],
          propertyOrdering: ["id", "type", "content", "options", "correctAnswers", "explanation"],
        }
      }
    }
  });

  try {
    const rawQuestions = JSON.parse(response.text);
    // Ensure ID sequence and proper mapping
    return rawQuestions.map((q: any, index: number) => ({
      ...q,
      id: index + 1
    }));
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("试题生成失败，请重试");
  }
};
