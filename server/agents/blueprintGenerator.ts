import { ThinkingLevel, Type } from '@google/genai';
import type {
  ClarificationAnswer,
  DatasetEntry,
  DatasetPreview,
  MlArchitectureBlueprint,
  RagChunkReference,
  RequirementAnalysis,
} from '../../src/types/ml.ts';
import {
  extractJsonObject,
  GEMINI_FAST_MODEL,
  GEMINI_MODEL,
  getGeminiClient,
  withRetry,
} from './geminiClient.ts';

type GeneratedBlueprintCore = Omit<MlArchitectureBlueprint, 'ragReferences' | 'criticReport' | 'generatedAt'>;

export async function runBlueprintGenerator(params: {
  prompt: string;
  requirements: Omit<RequirementAnalysis, 'clarificationQuestions'>;
  clarifications: ClarificationAnswer[];
  dataset?: DatasetEntry | null;
  datasetPreview?: DatasetPreview | null;
  ragContext: string;
  ragReferences: RagChunkReference[];
}): Promise<GeneratedBlueprintCore> {
  const ai = getGeminiClient();

  const clarificationText =
    params.clarifications.length > 0
      ? params.clarifications
          .map((c, idx) => `${idx + 1}. Q: ${c.question}\n   A: ${c.answer}`)
          .join('\n')
      : 'None (user proceeded directly or prompt was already fully specified).';

  const datasetBlock = params.dataset
    ? `Attached Curated Dataset (Verified):
- Name: ${params.dataset.name}
- Repository: ${params.dataset.repository} (${params.dataset.sourceUrl})
- Category & Task: ${params.dataset.category} — ${params.dataset.taskType}
- Dimensions: ${params.dataset.rows.toLocaleString()} rows × ${params.dataset.columnCount} columns
- Target Column: ${params.dataset.targetColumn}
- Columns: ${params.dataset.columns.join(', ')}
- Sample Rows (Live Fetch ${params.datasetPreview?.fetchedLive ? 'Verified' : 'Schema Reference'}):
${
  params.datasetPreview && params.datasetPreview.rows.length > 0
    ? params.datasetPreview.rows
        .slice(0, 4)
        .map((r) => `  [${r.slice(0, 8).join(', ')}${r.length > 8 ? ', ...' : ''}]`)
        .join('\n')
    : '  (Archive/large dataset — rely on verified schema above)'
}`
    : 'No specific public dataset attached. Design the dataset strategy and collection pipeline specifically for the domain described in the user prompt.';

  const systemInstruction = `You are the Blueprint Generator Agent in BuildMyML, a Principal Machine Learning Systems Architect.
Synthesize a complete, production-grade, 20-section Machine Learning Project Architecture strictly tailored to the user's prompt, clarifications, attached dataset schema, and retrieved RAG engineering guidelines.

CRITICAL REQUIREMENTS:
1. Ground every technical decision in the actual prompt, dataset columns/row count (when attached), and RAG patterns. Never emit generic boilerplate! Reference exact column names, exact sample counts, exact domain constraints, and concrete library/tool names.
2. In systemArchitectureDiagram, create 6 to 8 nodes spanning the 5 layers ('Ingestion', 'Processing', 'Modeling', 'Serving', 'Monitoring') and 6 to 10 directed edges connecting them cleanly into an end-to-end ML pipeline. Use short, valid node IDs like 'n1', 'n2', ..., 'n7'.
3. In candidateAlgorithms, include 4 distinct algorithms spanning at least 1 Baseline Benchmark, 1 Primary Production candidate, and 1–2 Challenger/Interpretability models suited to the dataset size and modality.
4. Keep every section concise, authoritative, and technical—written for a senior engineering review or final-year capstone architecture document.`;

  const userContent = `User Project Prompt:
"""
${params.prompt}
"""

Structured Requirement Analysis:
- Suggested Title: ${params.requirements.suggestedTitle}
- Domain: ${params.requirements.domain}
- ML Task Type: ${params.requirements.mlTaskType}
- Data Modality: ${params.requirements.dataModality}
- Target Objective: ${params.requirements.targetObjective}
- Deployment Target: ${params.requirements.deploymentTarget}
- Latency Constraint: ${params.requirements.latencyConstraint}
- Scale Profile: ${params.requirements.scaleProfile}
- Key Constraints: ${params.requirements.keyConstraints.join('; ')}

User Clarifications:
${clarificationText}

${datasetBlock}

Retrieved ML Engineering Knowledge (RAG):
${params.ragContext}`;

  const schemaConfig = {
    type: Type.OBJECT,
    properties: {
            title: { type: Type.STRING },
            mlTaskType: { type: Type.STRING },
            projectOverview: { type: Type.STRING },
            problemDefinition: { type: Type.STRING },
            objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
            mlTaskIdentification: {
              type: Type.OBJECT,
              properties: {
                primaryTask: { type: Type.STRING },
                learningParadigm: { type: Type.STRING },
                inputSchemaSummary: { type: Type.STRING },
                outputFormat: { type: Type.STRING },
                rationale: { type: Type.STRING },
              },
              required: ['primaryTask', 'learningParadigm', 'inputSchemaSummary', 'outputFormat', 'rationale'],
            },
            datasetStrategy: {
              type: Type.OBJECT,
              properties: {
                strategySummary: { type: Type.STRING },
                samplingAndSplitting: { type: Type.STRING },
                classBalanceAndCoverage: { type: Type.STRING },
                dataGovernanceNotes: { type: Type.STRING },
              },
              required: ['strategySummary', 'samplingAndSplitting', 'classBalanceAndCoverage', 'dataGovernanceNotes'],
            },
            dataCollection: {
              type: Type.OBJECT,
              properties: {
                primarySources: { type: Type.ARRAY, items: { type: Type.STRING } },
                ingestionCadence: { type: Type.STRING },
                schemaValidationRules: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['primarySources', 'ingestionCadence', 'schemaValidationRules'],
            },
            dataPreprocessing: {
              type: Type.OBJECT,
              properties: {
                pipelineSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingValueStrategy: { type: Type.STRING },
                outlierAndNoiseHandling: { type: Type.STRING },
                scalingAndEncoding: { type: Type.STRING },
              },
              required: ['pipelineSteps', 'missingValueStrategy', 'outlierAndNoiseHandling', 'scalingAndEncoding'],
            },
            exploratoryDataAnalysis: {
              type: Type.OBJECT,
              properties: {
                keyHypotheses: { type: Type.ARRAY, items: { type: Type.STRING } },
                statisticalChecks: { type: Type.ARRAY, items: { type: Type.STRING } },
                leakageAndBiasAudits: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['keyHypotheses', 'statisticalChecks', 'leakageAndBiasAudits'],
            },
            featureEngineering: {
              type: Type.OBJECT,
              properties: {
                engineeredFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
                domainTransformations: { type: Type.ARRAY, items: { type: Type.STRING } },
                leakagePreventionGuardrails: { type: Type.STRING },
              },
              required: ['engineeredFeatures', 'domainTransformations', 'leakagePreventionGuardrails'],
            },
            featureSelection: {
              type: Type.OBJECT,
              properties: {
                selectionMethods: { type: Type.ARRAY, items: { type: Type.STRING } },
                expectedDimensionalityImpact: { type: Type.STRING },
                multicollinearityHandling: { type: Type.STRING },
              },
              required: ['selectionMethods', 'expectedDimensionalityImpact', 'multicollinearityHandling'],
            },
            candidateAlgorithms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  algorithm: { type: Type.STRING },
                  family: { type: Type.STRING },
                  strengths: { type: Type.STRING },
                  tradeoffs: { type: Type.STRING },
                  computeCost: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                  interpretability: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                  recommendedRole: {
                    type: Type.STRING,
                    enum: ['Primary Production', 'Baseline Benchmark', 'Ensemble Challenger', 'Interpretability Reference'],
                  },
                },
                required: ['algorithm', 'family', 'strengths', 'tradeoffs', 'computeCost', 'interpretability', 'recommendedRole'],
              },
            },
            modelSelectionJustification: { type: Type.STRING },
            trainingPipeline: {
              type: Type.OBJECT,
              properties: {
                orchestrationSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                hyperparameterTuningStrategy: { type: Type.STRING },
                reproducibilityControls: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['orchestrationSteps', 'hyperparameterTuningStrategy', 'reproducibilityControls'],
            },
            evaluationMetrics: {
              type: Type.OBJECT,
              properties: {
                primaryMetric: { type: Type.STRING },
                secondaryMetrics: { type: Type.ARRAY, items: { type: Type.STRING } },
                businessThresholdAlignment: { type: Type.STRING },
              },
              required: ['primaryMetric', 'secondaryMetrics', 'businessThresholdAlignment'],
            },
            validationStrategy: {
              type: Type.OBJECT,
              properties: {
                splittingProtocol: { type: Type.STRING },
                crossValidationConfig: { type: Type.STRING },
                errorAnalysisPlan: { type: Type.STRING },
              },
              required: ['splittingProtocol', 'crossValidationConfig', 'errorAnalysisPlan'],
            },
            systemArchitectureDiagram: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                nodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      layer: { type: Type.STRING, enum: ['Ingestion', 'Processing', 'Modeling', 'Serving', 'Monitoring'] },
                      detail: { type: Type.STRING },
                    },
                    required: ['id', 'label', 'layer', 'detail'],
                  },
                },
                edges: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      from: { type: Type.STRING },
                      to: { type: Type.STRING },
                      label: { type: Type.STRING },
                    },
                    required: ['from', 'to', 'label'],
                  },
                },
              },
              required: ['title', 'nodes', 'edges'],
            },
            technologyStack: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  layer: { type: Type.STRING },
                  tools: { type: Type.ARRAY, items: { type: Type.STRING } },
                  justification: { type: Type.STRING },
                },
                required: ['layer', 'tools', 'justification'],
              },
            },
            deploymentStrategy: {
              type: Type.OBJECT,
              properties: {
                servingPattern: { type: Type.STRING },
                infrastructureDesign: { type: Type.STRING },
                rolloutAndFallbackPlan: { type: Type.STRING },
              },
              required: ['servingPattern', 'infrastructureDesign', 'rolloutAndFallbackPlan'],
            },
            monitoringAndMaintenance: {
              type: Type.OBJECT,
              properties: {
                dataAndConceptDriftChecks: { type: Type.ARRAY, items: { type: Type.STRING } },
                performanceAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
                retrainingCadence: { type: Type.STRING },
              },
              required: ['dataAndConceptDriftChecks', 'performanceAlerts', 'retrainingCadence'],
            },
            implementationRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
                  exitCriteria: { type: Type.STRING },
                },
                required: ['phase', 'duration', 'deliverables', 'exitCriteria'],
              },
            },
          },
          required: [
            'title',
            'mlTaskType',
            'projectOverview',
            'problemDefinition',
            'objectives',
            'mlTaskIdentification',
            'datasetStrategy',
            'dataCollection',
            'dataPreprocessing',
            'exploratoryDataAnalysis',
            'featureEngineering',
            'featureSelection',
            'candidateAlgorithms',
            'modelSelectionJustification',
            'trainingPipeline',
            'evaluationMetrics',
            'validationStrategy',
            'systemArchitectureDiagram',
            'technologyStack',
            'deploymentStrategy',
            'monitoringAndMaintenance',
            'implementationRoadmap',
          ],
  };

  let response;
  try {
    response = await withRetry(
      () =>
        ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: userContent,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: schemaConfig,
          },
        }),
      1,
      30000
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isModelUnavailable =
      msg.includes('503') ||
      msg.includes('429') ||
      msg.includes('RESOURCE_EXHAUSTED') ||
      msg.includes('UNAVAILABLE') ||
      msg.includes('timed out');
    if (!isModelUnavailable) {
      throw err;
    }
    response = await withRetry(
      () =>
        ai.models.generateContent({
          model: GEMINI_FAST_MODEL,
          contents: userContent,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: schemaConfig,
          },
        }),
      2,
      35000
    );
  }

  return extractJsonObject<GeneratedBlueprintCore>(response.text, 'BlueprintGenerator');
}
