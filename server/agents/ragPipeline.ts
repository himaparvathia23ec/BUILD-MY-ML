import type { DatasetEntry, RagChunkReference, RequirementAnalysis } from '../../src/types/ml.ts';
import { ML_KNOWLEDGE_BASE, type KnowledgeDocument } from '../knowledge/mlKnowledgeBase.ts';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

function scoreDocument(
  doc: KnowledgeDocument,
  queryTokens: Set<string>,
  modality: RequirementAnalysis['dataModality'],
  dataset?: DatasetEntry | null
): number {
  let score = 0;

  if (doc.modalities.includes(modality)) {
    score += 3.5;
  }

  for (const tag of doc.tags) {
    if (queryTokens.has(tag.toLowerCase())) {
      score += 2.5;
    }
  }

  const docTokens = tokenize(`${doc.title} ${doc.category} ${doc.content}`);
  let lexicalMatches = 0;
  for (const tok of docTokens) {
    if (queryTokens.has(tok)) {
      lexicalMatches += 1;
    }
  }
  score += Math.min(lexicalMatches * 0.4, 4.0);

  // Explicit dataset-regime boosters so retrieved knowledge adapts accurately to real data scale
  if (dataset) {
    if (dataset.rows < 1500 && doc.id === 'kb-small-dataset-regularization') {
      score += 4.5;
    }
    if (dataset.columnCount >= 20 && doc.id === 'kb-feature-selection-multicollinearity') {
      score += 3.5;
    }
    if (dataset.category === 'Healthcare' || dataset.category === 'Finance') {
      if (doc.id === 'kb-explainability-shap' || doc.id === 'kb-imbalanced-classification') {
        score += 3.0;
      }
    }
    if (dataset.category === 'Time Series' && doc.id === 'kb-time-series-splitting') {
      score += 4.5;
    }
    if (dataset.category === 'Regression' && doc.id === 'kb-regression-diagnostics') {
      score += 4.5;
    }
    if (dataset.category === 'NLP & Text' && doc.id === 'kb-nlp-text-pipelines') {
      score += 4.5;
    }
    if (dataset.category === 'Computer Vision' && doc.id === 'kb-vision-cnn-transfer') {
      score += 4.5;
    }
  }

  return Number(score.toFixed(2));
}

export function runRagPipeline(params: {
  prompt: string;
  requirements: Omit<RequirementAnalysis, 'clarificationQuestions'>;
  dataset?: DatasetEntry | null;
  topK?: number;
}): { references: RagChunkReference[]; contextText: string } {
  const topK = params.topK ?? 5;
  const combinedQuery = [
    params.prompt,
    params.requirements.domain,
    params.requirements.mlTaskType,
    params.requirements.targetObjective,
    params.requirements.deploymentTarget,
    params.requirements.keyConstraints.join(' '),
    params.dataset ? `${params.dataset.name} ${params.dataset.category} ${params.dataset.taskType}` : '',
  ].join(' ');

  const queryTokens = new Set(tokenize(combinedQuery));

  const ranked = ML_KNOWLEDGE_BASE.map((doc) => ({
    doc,
    score: scoreDocument(doc, queryTokens, params.requirements.dataModality, params.dataset),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const references: RagChunkReference[] = ranked.map(({ doc, score }) => ({
    id: doc.id,
    title: doc.title,
    category: doc.category,
    relevanceScore: score,
    summary: doc.content,
    applicabilityNote: doc.applicabilityNote,
  }));

  const contextText = ranked
    .map(
      ({ doc, score }, idx) =>
        `[RAG-${idx + 1}: ${doc.title} | Category: ${doc.category} | Score: ${score}]\n${doc.content}`
    )
    .join('\n\n');

  return { references, contextText };
}
