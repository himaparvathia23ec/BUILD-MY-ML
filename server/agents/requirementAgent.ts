import { ThinkingLevel, Type } from '@google/genai';
import type { DatasetEntry, DatasetPreview, RequirementAnalysis } from '../../src/types/ml.ts';
import { extractJsonObject, GEMINI_FAST_MODEL, getGeminiClient, withRetry } from './geminiClient.ts';

interface RawRequirementResponse {
  suggestedTitle: string;
  domain: string;
  mlTaskType: string;
  dataModality: 'tabular' | 'text' | 'time-series' | 'vision' | 'multimodal';
  targetObjective: string;
  deploymentTarget: string;
  latencyConstraint: string;
  scaleProfile: string;
  keyConstraints: string[];
  isUnderspecified: boolean;
}

export async function runRequirementAgent(params: {
  prompt: string;
  dataset?: DatasetEntry | null;
  datasetPreview?: DatasetPreview | null;
}): Promise<Omit<RequirementAnalysis, 'clarificationQuestions'>> {
  const ai = getGeminiClient();

  const datasetContext = params.dataset
    ? `Selected Dataset:
- Name: ${params.dataset.name} (${params.dataset.repository})
- Category: ${params.dataset.category}
- Task Type: ${params.dataset.taskType}
- Verified Rows: ${params.dataset.rows}, Columns: ${params.dataset.columnCount}
- Target Column: ${params.dataset.targetColumn}
- Columns: ${params.dataset.columns.join(', ')}
- Sample Rows Available: ${params.datasetPreview?.rows?.length ?? 0}`
    : 'Selected Dataset: None (user did not attach a curated dataset yet).';

  const systemInstruction = `You are the Requirement Agent in BuildMyML, a senior ML systems architect.
Analyze the user's project prompt and optional attached dataset metadata.
Extract structured ML engineering requirements accurately without inventing fake details.
Determine whether the prompt is underspecified (isUnderspecified = true) when the prompt is brief (under ~25 words) and omits explicit deployment mode, latency SLA, or evaluation/error-cost priorities—even if a dataset is attached. If the prompt already specifies problem statement, objectives, data requirements, and expected outcomes/deployment, set isUnderspecified = false.`;

  const userContent = `User Prompt:
"""
${params.prompt}
"""

${datasetContext}`;

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
            suggestedTitle: { type: Type.STRING, description: 'Concise, professional ML project title (max 80 chars).' },
            domain: { type: Type.STRING, description: 'Industry or scientific domain.' },
            mlTaskType: { type: Type.STRING, description: 'Specific ML problem formulation (e.g., Binary Classification, Spatial Regression, Time-Series Forecasting).' },
            dataModality: {
              type: Type.STRING,
              enum: ['tabular', 'text', 'time-series', 'vision', 'multimodal'],
            },
            targetObjective: { type: Type.STRING, description: 'Primary predictive or business outcome.' },
            deploymentTarget: { type: Type.STRING, description: 'Inferred or stated serving pattern (e.g., REST microservice, batch pipeline, edge).' },
            latencyConstraint: { type: Type.STRING, description: 'Inferred or stated latency requirement.' },
            scaleProfile: { type: Type.STRING, description: 'Expected dataset and traffic scale.' },
            keyConstraints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 5 key technical, regulatory, or operational constraints.',
            },
            isUnderspecified: {
              type: Type.BOOLEAN,
              description: 'True if prompt is brief or missing key deployment/target/scale requirements that benefit from clarification.',
            },
          },
          required: [
            'suggestedTitle',
            'domain',
            'mlTaskType',
            'dataModality',
            'targetObjective',
            'deploymentTarget',
            'latencyConstraint',
            'scaleProfile',
            'keyConstraints',
            'isUnderspecified',
          ],
        },
      },
    })
  );

  return extractJsonObject<RawRequirementResponse>(response.text, 'RequirementAgent');
}
