import { jsPDF } from 'jspdf';
import type { ClarificationAnswer, DatasetEntry, MlArchitectureBlueprint } from '../types/ml';
import { renderDiagramToPngDataUrl } from './diagramRenderer';

export interface PdfGenerationInput {
  prompt: string;
  clarifications?: ClarificationAnswer[];
  dataset?: DatasetEntry | null;
  blueprint: MlArchitectureBlueprint;
}

export async function generateArchitecturePdfBlob(input: PdfGenerationInput): Promise<Blob> {
  const { blueprint, prompt, dataset, clarifications } = input;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2;
  const bottomLimit = pageHeight - 18;
  let y = 20;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > bottomLimit) {
      doc.addPage();
      y = 20;
    }
  };

  const addSectionHeading = (num: string, title: string) => {
    ensureSpace(16);
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`${num}. ${title}`, marginX, y);
    y += 6;
  };

  const addSubHeading = (label: string) => {
    ensureSpace(9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(37, 99, 235);
    doc.text(label, marginX, y);
    y += 4.5;
  };

  const addParagraph = (text: string, indent = 0) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(text.trim() || 'N/A', contentWidth - indent) as string[];
    for (const line of lines) {
      ensureSpace(5);
      doc.text(line, marginX + indent, y);
      y += 4.5;
    }
    y += 1.5;
  };

  const addBulletList = (items: string[]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    for (const item of items) {
      const lines = doc.splitTextToSize(`•  ${item}`, contentWidth - 4) as string[];
      for (let i = 0; i < lines.length; i++) {
        ensureSpace(5);
        doc.text(lines[i], marginX + (i === 0 ? 2 : 6), y);
        y += 4.5;
      }
    }
    y += 1.5;
  };

  // Document Cover Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(marginX, y - 6, contentWidth, 30, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(147, 197, 253);
  doc.text('BUILDMYML MACHINE LEARNING ARCHITECTURE SPECIFICATION', marginX + 6, y + 1);

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(blueprint.title, contentWidth - 12) as string[];
  doc.text(titleLines.slice(0, 2), marginX + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Task: ${blueprint.mlTaskType}  |  Generated: ${new Date(blueprint.generatedAt).toLocaleDateString()}`,
    marginX + 6,
    y + 20
  );
  y += 32;

  // Original Prompt Box
  addSubHeading('Original Project Prompt');
  const promptLines = doc.splitTextToSize(prompt, contentWidth - 8) as string[];
  const promptBoxHeight = Math.max(12, promptLines.length * 4.4 + 6);
  ensureSpace(promptBoxHeight + 4);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(marginX, y, contentWidth, promptBoxHeight, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(promptLines, marginX + 4, y + 5.5);
  y += promptBoxHeight + 4;

  if (clarifications && clarifications.length > 0) {
    addSubHeading('Clarifications Applied');
    addBulletList(clarifications.map((c) => `${c.question} -> ${c.answer}`));
  }

  if (dataset) {
    addSubHeading('Associated Verified Public Dataset');
    addParagraph(
      `${dataset.name} (${dataset.repository}) · ${dataset.rows.toLocaleString()} rows × ${dataset.columnCount} columns · Format: ${dataset.format} · Target: ${dataset.targetColumn}`
    );
    addParagraph(`Verified Source URL: ${dataset.sourceUrl}`);
  }

  // Sections 1 - 10
  addSectionHeading('01', 'Project Overview');
  addParagraph(blueprint.projectOverview);

  addSectionHeading('02', 'Problem Definition');
  addParagraph(blueprint.problemDefinition);

  addSectionHeading('03', 'Objectives');
  addBulletList(blueprint.objectives);

  addSectionHeading('04', 'ML Task Identification');
  addParagraph(`Primary Task: ${blueprint.mlTaskIdentification.primaryTask}`);
  addParagraph(`Learning Paradigm: ${blueprint.mlTaskIdentification.learningParadigm}`);
  addParagraph(`Input Schema: ${blueprint.mlTaskIdentification.inputSchemaSummary}`);
  addParagraph(`Output Format: ${blueprint.mlTaskIdentification.outputFormat}`);
  addParagraph(blueprint.mlTaskIdentification.rationale);

  addSectionHeading('05', 'Dataset Strategy');
  addParagraph(blueprint.datasetStrategy.strategySummary);
  addSubHeading('Sampling & Splitting');
  addParagraph(blueprint.datasetStrategy.samplingAndSplitting);
  addSubHeading('Class Balance & Coverage');
  addParagraph(blueprint.datasetStrategy.classBalanceAndCoverage);
  addSubHeading('Governance & Licensing');
  addParagraph(blueprint.datasetStrategy.dataGovernanceNotes);

  addSectionHeading('06', 'Data Collection');
  addSubHeading('Primary Sources');
  addBulletList(blueprint.dataCollection.primarySources);
  addParagraph(`Ingestion Cadence: ${blueprint.dataCollection.ingestionCadence}`);
  addSubHeading('Schema Validation Rules');
  addBulletList(blueprint.dataCollection.schemaValidationRules);

  addSectionHeading('07', 'Data Preprocessing Pipeline');
  addBulletList(blueprint.dataPreprocessing.pipelineSteps);
  addParagraph(`Missing Values: ${blueprint.dataPreprocessing.missingValueStrategy}`);
  addParagraph(`Outlier & Noise Handling: ${blueprint.dataPreprocessing.outlierAndNoiseHandling}`);
  addParagraph(`Scaling & Encoding: ${blueprint.dataPreprocessing.scalingAndEncoding}`);

  addSectionHeading('08', 'Exploratory Data Analysis');
  addSubHeading('Key Hypotheses');
  addBulletList(blueprint.exploratoryDataAnalysis.keyHypotheses);
  addSubHeading('Statistical Checks');
  addBulletList(blueprint.exploratoryDataAnalysis.statisticalChecks);
  addSubHeading('Leakage & Bias Audits');
  addBulletList(blueprint.exploratoryDataAnalysis.leakageAndBiasAudits);

  addSectionHeading('09', 'Feature Engineering');
  addSubHeading('Engineered Features');
  addBulletList(blueprint.featureEngineering.engineeredFeatures);
  addSubHeading('Domain Transformations');
  addBulletList(blueprint.featureEngineering.domainTransformations);
  addParagraph(`Leakage Guardrails: ${blueprint.featureEngineering.leakagePreventionGuardrails}`);

  addSectionHeading('10', 'Feature Selection');
  addBulletList(blueprint.featureSelection.selectionMethods);
  addParagraph(`Dimensionality Impact: ${blueprint.featureSelection.expectedDimensionalityImpact}`);
  addParagraph(`Multicollinearity Handling: ${blueprint.featureSelection.multicollinearityHandling}`);

  // Section 11: Candidate Algorithms Comparison Table
  addSectionHeading('11', 'Candidate Algorithms Comparison');
  for (const row of blueprint.candidateAlgorithms) {
    const blockLines = [
      `${row.algorithm} (${row.family}) — Role: ${row.recommendedRole}`,
      `Strengths: ${row.strengths}`,
      `Tradeoffs: ${row.tradeoffs} | Compute: ${row.computeCost} | Interpretability: ${row.interpretability}`,
    ];
    const wrapped = blockLines.flatMap((l) => doc.splitTextToSize(l, contentWidth - 6) as string[]);
    const rowHeight = wrapped.length * 4.3 + 5;
    ensureSpace(rowHeight + 2);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(marginX, y, contentWidth, rowHeight, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    let innerY = y + 4.5;
    const firstLine = doc.splitTextToSize(blockLines[0], contentWidth - 6) as string[];
    doc.text(firstLine, marginX + 3, innerY);
    innerY += firstLine.length * 4.3;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const restLines = [
      ...(doc.splitTextToSize(blockLines[1], contentWidth - 6) as string[]),
      ...(doc.splitTextToSize(blockLines[2], contentWidth - 6) as string[]),
    ];
    doc.text(restLines, marginX + 3, innerY);
    y += rowHeight + 3;
  }

  addSectionHeading('12', 'Model Selection Justification');
  addParagraph(blueprint.modelSelectionJustification);

  addSectionHeading('13', 'Training Pipeline');
  addBulletList(blueprint.trainingPipeline.orchestrationSteps);
  addParagraph(`Hyperparameter Tuning: ${blueprint.trainingPipeline.hyperparameterTuningStrategy}`);
  addSubHeading('Reproducibility Controls');
  addBulletList(blueprint.trainingPipeline.reproducibilityControls);

  addSectionHeading('14', 'Evaluation Metrics');
  addParagraph(`Primary Metric: ${blueprint.evaluationMetrics.primaryMetric}`);
  addSubHeading('Secondary Metrics');
  addBulletList(blueprint.evaluationMetrics.secondaryMetrics);
  addParagraph(`Threshold Alignment: ${blueprint.evaluationMetrics.businessThresholdAlignment}`);

  addSectionHeading('15', 'Validation Strategy');
  addParagraph(`Splitting Protocol: ${blueprint.validationStrategy.splittingProtocol}`);
  addParagraph(`Cross-Validation Configuration: ${blueprint.validationStrategy.crossValidationConfig}`);
  addParagraph(`Error Analysis Plan: ${blueprint.validationStrategy.errorAnalysisPlan}`);

  // Section 16: System Architecture Diagram
  addSectionHeading('16', 'System Architecture Diagram');
  try {
    const png = await renderDiagramToPngDataUrl(blueprint.systemArchitectureDiagram);
    const imgWidth = contentWidth;
    const imgHeight = (png.height / png.width) * imgWidth;
    ensureSpace(imgHeight + 10);
    doc.setDrawColor(226, 232, 240);
    doc.rect(marginX, y, imgWidth, imgHeight, 'S');
    doc.addImage(png.dataUrl, 'PNG', marginX, y, imgWidth, imgHeight);
    y += imgHeight + 6;
  } catch {
    addParagraph('System Architecture Nodes:');
    addBulletList(
      blueprint.systemArchitectureDiagram.nodes.map((n) => `[${n.layer}] ${n.label}: ${n.detail}`)
    );
  }

  addSectionHeading('17', 'Technology Stack');
  for (const group of blueprint.technologyStack) {
    ensureSpace(14);
    addSubHeading(group.layer);
    addParagraph(`Tools: ${group.tools.join(', ')}`);
    addParagraph(group.justification);
  }

  addSectionHeading('18', 'Deployment Strategy');
  addParagraph(`Serving Pattern: ${blueprint.deploymentStrategy.servingPattern}`);
  addParagraph(`Infrastructure Design: ${blueprint.deploymentStrategy.infrastructureDesign}`);
  addParagraph(`Rollout & Fallback: ${blueprint.deploymentStrategy.rolloutAndFallbackPlan}`);

  addSectionHeading('19', 'Monitoring and Maintenance');
  addSubHeading('Data & Concept Drift Telemetry');
  addBulletList(blueprint.monitoringAndMaintenance.dataAndConceptDriftChecks);
  addSubHeading('Performance Alerts');
  addBulletList(blueprint.monitoringAndMaintenance.performanceAlerts);
  addParagraph(`Retraining Cadence: ${blueprint.monitoringAndMaintenance.retrainingCadence}`);

  addSectionHeading('20', 'Implementation Roadmap');
  for (const phase of blueprint.implementationRoadmap) {
    ensureSpace(22);
    addSubHeading(`${phase.phase} (${phase.duration})`);
    addBulletList(phase.deliverables);
    addParagraph(`Exit Criteria: ${phase.exitCriteria}`);
  }

  // Grounding & Critic Audit Summary
  addSectionHeading('A1', 'RAG Grounding & Critic Validation Audit');
  addParagraph(blueprint.criticReport.overallAssessment);
  addBulletList(
    blueprint.criticReport.findings.map((f) => `[${f.severity}] ${f.area}: ${f.observation} -> ${f.mitigation}`)
  );

  // Page numbers & running footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `BuildMyML Architecture Specification · Page ${p} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
