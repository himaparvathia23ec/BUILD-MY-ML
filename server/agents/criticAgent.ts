import { ThinkingLevel, Type } from '@google/genai';
import type {
  CriticReport,
  DatasetEntry,
  MlArchitectureBlueprint,
  RequirementAnalysis,
} from '../../src/types/ml.ts';
import { extractJsonObject, GEMINI_FAST_MODEL, getGeminiClient, withRetry } from './geminiClient.ts';

interface RawCriticAuditResponse {
  overallAssessment: string;
  leakageChecksPassed: boolean;
  datasetAlignmentVerified: boolean;
  findings: CriticReport['findings'];
  refinementsApplied: string[];
  patchedValidationSplitting?: string;
  patchedLeakageGuardrail?: string;
  patchedPrimaryMetric?: string;
}

export async function runCriticAgent(params: {
  prompt: string;
  requirements: Omit<RequirementAnalysis, 'clarificationQuestions'>;
  dataset?: DatasetEntry | null;
  draftBlueprint: Omit<MlArchitectureBlueprint, 'ragReferences' | 'criticReport' | 'generatedAt'>;
}): Promise<{
  validatedBlueprint: Omit<MlArchitectureBlueprint, 'ragReferences' | 'criticReport' | 'generatedAt'>;
  criticReport: CriticReport;
}> {
  const ai = getGeminiClient();

  const systemInstruction = `You are the Critic Agent in BuildMyML, a Principal ML Architecture Auditor.
Audit the generated ML architecture blueprint rigorously against:
1. Original prompt objectives and constraints.
2. Attached dataset size (${params.dataset ? `${params.dataset.rows} rows, ${params.dataset.columnCount} cols, target "${params.dataset.targetColumn}"` : 'No attached dataset'}), data modality (${params.requirements.dataModality}), and identifier/proxy leakage risks.
3. Evaluation metric and validation protocol soundness (e.g., no random K-fold on time-series; no SMOTE outside CV folds; no accuracy-only evaluation on imbalanced problems).
4. System architecture diagram edge integrity (all node IDs referenced by edges must exist).

Return structured findings (3 to 5 concise technical checks) and optional patched fields ONLY if a specific section needs tightening.`;

  const userContent = `Prompt: "${params.prompt}"
Modality: ${params.requirements.dataModality} | Task: ${params.requirements.mlTaskType}
Dataset: ${params.dataset ? `${params.dataset.name} (${params.dataset.rows} rows × ${params.dataset.columnCount} cols, columns: ${params.dataset.columns.slice(0, 12).join(', ')})` : 'None'}

Draft Blueprint Excerpt to Audit:
- Title: ${params.draftBlueprint.title}
- Primary Task: ${params.draftBlueprint.mlTaskIdentification.primaryTask}
- Splitting Protocol: ${params.draftBlueprint.validationStrategy.splittingProtocol}
- CV Config: ${params.draftBlueprint.validationStrategy.crossValidationConfig}
- Primary Metric: ${params.draftBlueprint.evaluationMetrics.primaryMetric}
- Preprocessing Scaling/Encoding: ${params.draftBlueprint.dataPreprocessing.scalingAndEncoding}
- Leakage Guardrails: ${params.draftBlueprint.featureEngineering.leakagePreventionGuardrails}
- Candidate Algorithms: ${params.draftBlueprint.candidateAlgorithms.map((a) => `${a.algorithm} (${a.recommendedRole})`).join(', ')}
- Diagram Nodes (${params.draftBlueprint.systemArchitectureDiagram.nodes.length}): ${params.draftBlueprint.systemArchitectureDiagram.nodes.map((n) => n.id).join(', ')}`;

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
            overallAssessment: { type: Type.STRING },
            leakageChecksPassed: { type: Type.BOOLEAN },
            datasetAlignmentVerified: { type: Type.BOOLEAN },
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  area: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ['Nominal', 'Advisory', 'Critical Fix Applied'] },
                  observation: { type: Type.STRING },
                  mitigation: { type: Type.STRING },
                },
                required: ['area', 'severity', 'observation', 'mitigation'],
              },
            },
            refinementsApplied: { type: Type.ARRAY, items: { type: Type.STRING } },
            patchedValidationSplitting: { type: Type.STRING },
            patchedLeakageGuardrail: { type: Type.STRING },
            patchedPrimaryMetric: { type: Type.STRING },
          },
          required: [
            'overallAssessment',
            'leakageChecksPassed',
            'datasetAlignmentVerified',
            'findings',
            'refinementsApplied',
          ],
        },
      },
    })
  );

  const audit = extractJsonObject<RawCriticAuditResponse>(response.text, 'CriticAgent');

  // Deep-clone and enforce deterministic structural integrity on diagram edges & patched fields
  const validated = structuredClone(params.draftBlueprint);
  const validNodeIds = new Set(validated.systemArchitectureDiagram.nodes.map((n) => n.id));
  validated.systemArchitectureDiagram.edges = validated.systemArchitectureDiagram.edges.filter(
    (e) => validNodeIds.has(e.from) && validNodeIds.has(e.to) && e.from !== e.to
  );

  const refinementsApplied = [...(audit.refinementsApplied ?? [])];

  if (audit.patchedValidationSplitting && audit.patchedValidationSplitting.trim().length > 15) {
    validated.validationStrategy.splittingProtocol = audit.patchedValidationSplitting.trim();
  }
  if (audit.patchedLeakageGuardrail && audit.patchedLeakageGuardrail.trim().length > 15) {
    validated.featureEngineering.leakagePreventionGuardrails = audit.patchedLeakageGuardrail.trim();
  }
  if (audit.patchedPrimaryMetric && audit.patchedPrimaryMetric.trim().length > 5) {
    validated.evaluationMetrics.primaryMetric = audit.patchedPrimaryMetric.trim();
  }

  // Deterministic safeguard: ensure diagram is non-empty and connected if model dropped edges
  if (
    validated.systemArchitectureDiagram.edges.length === 0 &&
    validated.systemArchitectureDiagram.nodes.length >= 2
  ) {
    const nodes = validated.systemArchitectureDiagram.nodes;
    for (let i = 0; i < nodes.length - 1; i++) {
      validated.systemArchitectureDiagram.edges.push({
        from: nodes[i].id,
        to: nodes[i + 1].id,
        label: 'flows to',
      });
    }
    refinementsApplied.push('Reconstructed sequential pipeline edges for system architecture diagram completeness.');
  }

  return {
    validatedBlueprint: validated,
    criticReport: {
      overallAssessment: audit.overallAssessment,
      leakageChecksPassed: audit.leakageChecksPassed,
      datasetAlignmentVerified: audit.datasetAlignmentVerified,
      findings: audit.findings ?? [],
      refinementsApplied,
    },
  };
}
