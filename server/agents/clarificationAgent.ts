import { ThinkingLevel, Type } from '@google/genai';
import type { ClarificationQuestion, DatasetEntry, RequirementAnalysis } from '../../src/types/ml.ts';
import { extractJsonObject, GEMINI_FAST_MODEL, getGeminiClient, withRetry } from './geminiClient.ts';

interface RawClarificationResponse {
  questions: ClarificationQuestion[];
}

export async function runClarificationAgent(params: {
  prompt: string;
  requirements: Omit<RequirementAnalysis, 'clarificationQuestions'>;
  dataset?: DatasetEntry | null;
}): Promise<ClarificationQuestion[]> {
  if (!params.requirements.isUnderspecified) {
    return [];
  }

  const ai = getGeminiClient();

  const systemInstruction = `You are the Clarification Agent in BuildMyML.
The user submitted a brief or underspecified ML project idea.
Generate 2 or 3 crisp, high-leverage clarifying questions that directly shape the ML architecture (such as deployment latency mode, primary error cost/metric priority, interpretability/compliance needs, or data source shape).
Each question must have 3-4 concrete, practical multiple-choice options.`;

  const userContent = `Original Prompt: "${params.prompt}"
Extracted Initial Requirements:
- Domain: ${params.requirements.domain}
- ML Task: ${params.requirements.mlTaskType}
- Modality: ${params.requirements.dataModality}
- Dataset Attached: ${params.dataset ? `${params.dataset.name} (${params.dataset.rows} rows, target: ${params.dataset.targetColumn})` : 'None'}

Produce 2-3 targeted clarifying questions.`;

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: GEMINI_FAST_MODEL,
      contents: userContent,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  rationale: { type: Type.STRING, description: '1 short sentence explaining how this shapes the architecture.' },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  allowCustom: { type: Type.BOOLEAN },
                },
                required: ['id', 'question', 'rationale', 'options', 'allowCustom'],
              },
            },
          },
          required: ['questions'],
        },
      },
    })
  );

  const parsed = extractJsonObject<RawClarificationResponse>(response.text, 'ClarificationAgent');
  return (parsed.questions ?? []).slice(0, 4);
}
