import JSZip from 'jszip';
import type { ClarificationAnswer, DatasetEntry, MlArchitectureBlueprint } from '../types/ml';
import { renderDiagramToSvgString } from './diagramRenderer';
import { generateArchitecturePdfBlob } from './pdfGenerator';

export interface ZipExportInput {
  prompt: string;
  clarifications?: ClarificationAnswer[];
  dataset?: DatasetEntry | null;
  blueprint: MlArchitectureBlueprint;
}

function buildMarkdownSpec(input: ZipExportInput): string {
  const { blueprint, prompt, dataset, clarifications } = input;
  const lines: string[] = [
    `# ${blueprint.title}`,
    ``,
    `**ML Task:** ${blueprint.mlTaskType}  `,
    `**Generated:** ${blueprint.generatedAt}  `,
    dataset ? `**Dataset:** ${dataset.name} (${dataset.sourceUrl})` : `**Dataset:** Custom / Domain Collection Strategy`,
    ``,
    `## Original Prompt`,
    `> ${prompt.replace(/\n/g, '\n> ')}`,
    ``,
  ];

  if (clarifications && clarifications.length > 0) {
    lines.push(`## Clarifications Applied`);
    for (const c of clarifications) {
      lines.push(`- **${c.question}** -> ${c.answer}`);
    }
    lines.push('');
  }

  lines.push(
    `## 01. Project Overview`,
    blueprint.projectOverview,
    '',
    `## 02. Problem Definition`,
    blueprint.problemDefinition,
    '',
    `## 03. Objectives`,
    ...blueprint.objectives.map((o) => `- ${o}`),
    '',
    `## 04. ML Task Identification`,
    `- **Primary Task:** ${blueprint.mlTaskIdentification.primaryTask}`,
    `- **Learning Paradigm:** ${blueprint.mlTaskIdentification.learningParadigm}`,
    `- **Input Schema:** ${blueprint.mlTaskIdentification.inputSchemaSummary}`,
    `- **Output Format:** ${blueprint.mlTaskIdentification.outputFormat}`,
    `- **Rationale:** ${blueprint.mlTaskIdentification.rationale}`,
    '',
    `## 05. Dataset Strategy`,
    blueprint.datasetStrategy.strategySummary,
    `- **Sampling & Splitting:** ${blueprint.datasetStrategy.samplingAndSplitting}`,
    `- **Class Balance & Coverage:** ${blueprint.datasetStrategy.classBalanceAndCoverage}`,
    `- **Governance:** ${blueprint.datasetStrategy.dataGovernanceNotes}`,
    '',
    `## 06. Data Collection`,
    ...blueprint.dataCollection.primarySources.map((s) => `- Source: ${s}`),
    `- **Ingestion Cadence:** ${blueprint.dataCollection.ingestionCadence}`,
    ...blueprint.dataCollection.schemaValidationRules.map((r) => `- Schema Rule: ${r}`),
    '',
    `## 07. Data Preprocessing`,
    ...blueprint.dataPreprocessing.pipelineSteps.map((s) => `- ${s}`),
    `- **Missing Values:** ${blueprint.dataPreprocessing.missingValueStrategy}`,
    `- **Outliers & Noise:** ${blueprint.dataPreprocessing.outlierAndNoiseHandling}`,
    `- **Scaling & Encoding:** ${blueprint.dataPreprocessing.scalingAndEncoding}`,
    '',
    `## 08. Exploratory Data Analysis`,
    ...blueprint.exploratoryDataAnalysis.keyHypotheses.map((h) => `- Hypothesis: ${h}`),
    ...blueprint.exploratoryDataAnalysis.statisticalChecks.map((c) => `- Check: ${c}`),
    ...blueprint.exploratoryDataAnalysis.leakageAndBiasAudits.map((a) => `- Audit: ${a}`),
    '',
    `## 09. Feature Engineering`,
    ...blueprint.featureEngineering.engineeredFeatures.map((f) => `- ${f}`),
    ...blueprint.featureEngineering.domainTransformations.map((t) => `- Transform: ${t}`),
    `- **Leakage Guardrails:** ${blueprint.featureEngineering.leakagePreventionGuardrails}`,
    '',
    `## 10. Feature Selection`,
    ...blueprint.featureSelection.selectionMethods.map((m) => `- ${m}`),
    `- **Dimensionality Impact:** ${blueprint.featureSelection.expectedDimensionalityImpact}`,
    `- **Multicollinearity:** ${blueprint.featureSelection.multicollinearityHandling}`,
    '',
    `## 11. Candidate Algorithms`,
    `| Algorithm | Family | Role | Compute | Interpretability | Strengths | Tradeoffs |`,
    `| --- | --- | --- | --- | --- | --- | --- |`,
    ...blueprint.candidateAlgorithms.map(
      (a) =>
        `| ${a.algorithm} | ${a.family} | ${a.recommendedRole} | ${a.computeCost} | ${a.interpretability} | ${a.strengths} | ${a.tradeoffs} |`
    ),
    '',
    `## 12. Model Selection Justification`,
    blueprint.modelSelectionJustification,
    '',
    `## 13. Training Pipeline`,
    ...blueprint.trainingPipeline.orchestrationSteps.map((s) => `- ${s}`),
    `- **Hyperparameter Tuning:** ${blueprint.trainingPipeline.hyperparameterTuningStrategy}`,
    ...blueprint.trainingPipeline.reproducibilityControls.map((r) => `- Reproducibility: ${r}`),
    '',
    `## 14. Evaluation Metrics`,
    `- **Primary Metric:** ${blueprint.evaluationMetrics.primaryMetric}`,
    ...blueprint.evaluationMetrics.secondaryMetrics.map((m) => `- Secondary: ${m}`),
    `- **Threshold Alignment:** ${blueprint.evaluationMetrics.businessThresholdAlignment}`,
    '',
    `## 15. Validation Strategy`,
    `- **Splitting Protocol:** ${blueprint.validationStrategy.splittingProtocol}`,
    `- **Cross-Validation:** ${blueprint.validationStrategy.crossValidationConfig}`,
    `- **Error Analysis:** ${blueprint.validationStrategy.errorAnalysisPlan}`,
    '',
    `## 17. Technology Stack`,
    ...blueprint.technologyStack.map((g) => `- **${g.layer}:** ${g.tools.join(', ')} — ${g.justification}`),
    '',
    `## 18. Deployment Strategy`,
    `- **Serving Pattern:** ${blueprint.deploymentStrategy.servingPattern}`,
    `- **Infrastructure:** ${blueprint.deploymentStrategy.infrastructureDesign}`,
    `- **Rollout & Fallback:** ${blueprint.deploymentStrategy.rolloutAndFallbackPlan}`,
    '',
    `## 19. Monitoring and Maintenance`,
    ...blueprint.monitoringAndMaintenance.dataAndConceptDriftChecks.map((d) => `- Drift Check: ${d}`),
    ...blueprint.monitoringAndMaintenance.performanceAlerts.map((a) => `- Alert: ${a}`),
    `- **Retraining Cadence:** ${blueprint.monitoringAndMaintenance.retrainingCadence}`,
    '',
    `## 20. Implementation Roadmap`,
    ...blueprint.implementationRoadmap.flatMap((p) => [
      `### ${p.phase} (${p.duration})`,
      ...p.deliverables.map((d) => `- ${d}`),
      `- **Exit Criteria:** ${p.exitCriteria}`,
      '',
    ])
  );

  return lines.join('\n');
}

export async function generateProjectZipBlob(input: ZipExportInput): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder('BuildMyML_Project')!;
  const datasetDir = root.folder('Dataset')!;
  const docsDir = root.folder('Documentation')!;
  const archDir = root.folder('Architecture')!;

  // 1. Architecture.pdf
  const pdfBlob = await generateArchitecturePdfBlob(input);
  root.file('Architecture.pdf', pdfBlob);

  // 2. Dataset packaging (real download or verified external attribution)
  let datasetBundledStatus = 'No curated public dataset selected.';
  if (input.dataset) {
    const ds = input.dataset;
    datasetDir.file('DATASET_METADATA.json', JSON.stringify(ds, null, 2));
    datasetDir.file(
      'ATTRIBUTION.md',
      [
        `# Dataset Attribution: ${ds.name}`,
        ``,
        `- **Repository:** ${ds.repository}`,
        `- **Verified Source URL:** ${ds.sourceUrl}`,
        `- **Format:** ${ds.format}`,
        `- **Verified Rows:** ${ds.rows.toLocaleString()}`,
        `- **Verified Columns:** ${ds.columnCount}`,
        `- **Target Column:** ${ds.targetColumn}`,
        `- **License:** ${ds.license}`,
        ``,
        `## Packaging Notes`,
        ds.packagingNote,
      ].join('\n')
    );

    if (ds.canBundleInZip && ds.downloadUrl) {
      try {
        const res = await fetch(`/api/datasets/${encodeURIComponent(ds.id)}/download`);
        if (res.ok && res.headers.get('X-Dataset-Bundleable') === 'true') {
          const buf = await res.arrayBuffer();
          datasetDir.file(ds.fileName, buf);
          datasetBundledStatus = `Packaged verified dataset file \`Dataset/${ds.fileName}\` (${ds.rows.toLocaleString()} rows × ${ds.columnCount} columns).`;
        } else {
          datasetDir.file(
            'SOURCE_ACCESS.md',
            `# External Dataset Access Instructions\n\nDataset: **${ds.name}**\nVerified Source URL: ${ds.sourceUrl}\n\nReason not directly bundled: Remote upstream archive requires direct download from the verified source repository.`
          );
          datasetBundledStatus = `Linked verified external dataset source (${ds.sourceUrl}).`;
        }
      } catch {
        datasetDir.file(
          'SOURCE_ACCESS.md',
          `# External Dataset Access Instructions\n\nDataset: **${ds.name}**\nVerified Source URL: ${ds.sourceUrl}\n\nReason not directly bundled: Network error fetching upstream dataset during archive build; retrieve directly from the verified URL above.`
        );
        datasetBundledStatus = `Linked verified external dataset source (${ds.sourceUrl}).`;
      }
    } else {
      datasetDir.file(
        'SOURCE_ACCESS.md',
        [
          `# External Dataset Access Instructions`,
          ``,
          `**Dataset:** ${ds.name}`,
          `**Verified Source URL:** ${ds.sourceUrl}`,
          `**License:** ${ds.license}`,
          ``,
          `## Why This Dataset Is Linked Instead of Inline-Bundled`,
          ds.packagingNote,
        ].join('\n')
      );
      datasetBundledStatus = `Verified source URL documented in \`Dataset/SOURCE_ACCESS.md\` (${ds.sourceUrl}).`;
    }
  } else {
    datasetDir.file(
      'SOURCE_ACCESS.md',
      [
        `# Dataset Collection Specification`,
        ``,
        `No pre-existing public dataset was attached to this project generation run.`,
        `Refer to Sections 05 (Dataset Strategy) and 06 (Data Collection) in \`Documentation/ARCHITECTURE_SPEC.md\` for target sources and schema validation rules.`,
      ].join('\n')
    );
  }

  // 3. Documentation/
  docsDir.file('ARCHITECTURE_SPEC.md', buildMarkdownSpec(input));
  docsDir.file(
    'CRITIC_VALIDATION_REPORT.md',
    [
      `# Critic Agent Validation Report`,
      ``,
      `**Overall Assessment:** ${input.blueprint.criticReport.overallAssessment}`,
      `**Leakage Checks Passed:** ${input.blueprint.criticReport.leakageChecksPassed ? 'Yes' : 'Needs Review'}`,
      `**Dataset Alignment Verified:** ${input.blueprint.criticReport.datasetAlignmentVerified ? 'Yes' : 'Custom Scope'}`,
      ``,
      `## Findings`,
      ...input.blueprint.criticReport.findings.map(
        (f) => `- **[${f.severity}] ${f.area}:** ${f.observation}\n  - *Mitigation:* ${f.mitigation}`
      ),
      ``,
      `## Refinements Applied`,
      ...(input.blueprint.criticReport.refinementsApplied.length > 0
        ? input.blueprint.criticReport.refinementsApplied.map((r) => `- ${r}`)
        : ['- No post-generation patches required.']),
    ].join('\n')
  );
  docsDir.file(
    'RAG_REFERENCES.md',
    [
      `# Retrieved ML Engineering Knowledge (RAG)`,
      ``,
      ...input.blueprint.ragReferences.map(
        (r) =>
          `## ${r.title} (${r.category} · Relevance ${r.relevanceScore})\n${r.summary}\n\n*Applicability:* ${r.applicabilityNote}\n`
      ),
    ].join('\n')
  );

  // 4. Architecture/
  archDir.file('system_architecture.svg', renderDiagramToSvgString(input.blueprint.systemArchitectureDiagram));
  archDir.file('system_architecture.json', JSON.stringify(input.blueprint.systemArchitectureDiagram, null, 2));
  archDir.file('blueprint.json', JSON.stringify(input.blueprint, null, 2));

  // 5. README.md
  root.file(
    'README.md',
    [
      `# ${input.blueprint.title}`,
      ``,
      `Generated by **BuildMyML** on ${input.blueprint.generatedAt}.`,
      ``,
      `## Project Summary`,
      input.blueprint.projectOverview,
      ``,
      `## Package Contents`,
      `- \`Architecture.pdf\` — Complete formatted 20-section ML system specification and architecture diagram`,
      `- \`Dataset/\` — ${datasetBundledStatus}`,
      `- \`Documentation/ARCHITECTURE_SPEC.md\` — Markdown technical specification`,
      `- \`Documentation/CRITIC_VALIDATION_REPORT.md\` — Automated leakage and architecture audit report`,
      `- \`Documentation/RAG_REFERENCES.md\` — Grounded ML engineering patterns applied`,
      `- \`Architecture/system_architecture.svg\` — Vector system architecture diagram`,
      `- \`Architecture/blueprint.json\` — Machine-readable full architecture schema`,
      ``,
      `## Primary Model & Evaluation Target`,
      `- **ML Task:** ${input.blueprint.mlTaskType}`,
      `- **Primary Metric:** ${input.blueprint.evaluationMetrics.primaryMetric}`,
      `- **Serving Pattern:** ${input.blueprint.deploymentStrategy.servingPattern}`,
    ].join('\n')
  );

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}
