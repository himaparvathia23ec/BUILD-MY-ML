export type DatasetCategory =
  | 'All'
  | 'Classification'
  | 'Regression'
  | 'Healthcare'
  | 'Finance'
  | 'Time Series'
  | 'NLP & Text'
  | 'Computer Vision';

export interface DatasetEntry {
  id: string;
  name: string;
  repository: 'UCI ML Repository' | 'OpenML' | 'Vega / NOAA' | 'IBM / Public Repo' | 'StatLib / OpenML';
  category: Exclude<DatasetCategory, 'All'>;
  taskType: string;
  description: string;
  sourceUrl: string;
  downloadUrl: string | null;
  fileName: string;
  format: 'CSV' | 'ARFF-CSV' | 'TSV' | 'ZIP' | 'External Archive';
  delimiter: ',' | ';' | '\t';
  hasHeader: boolean;
  columns: string[];
  rows: number;
  columnCount: number;
  targetColumn: string;
  canBundleInZip: boolean;
  packagingNote: string;
  license: string;
}

export interface DatasetPreview {
  datasetId: string;
  columns: string[];
  rows: string[][];
  totalRowsVerified: number;
  fetchedLive: boolean;
  sourceUrl: string;
}

export interface PromptExample {
  id: string;
  category: 'quick' | 'detailed';
  title: string;
  domain: string;
  prompt: string;
  recommendedDatasetId?: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  rationale: string;
  options: string[];
  allowCustom: boolean;
}

export interface ClarificationAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface RequirementAnalysis {
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
  clarificationQuestions: ClarificationQuestion[];
}

export interface RagChunkReference {
  id: string;
  title: string;
  category: string;
  relevanceScore: number;
  summary: string;
  applicabilityNote: string;
}

export interface CandidateAlgorithmRow {
  algorithm: string;
  family: string;
  strengths: string;
  tradeoffs: string;
  computeCost: 'Low' | 'Medium' | 'High';
  interpretability: 'High' | 'Medium' | 'Low';
  recommendedRole: 'Primary Production' | 'Baseline Benchmark' | 'Ensemble Challenger' | 'Interpretability Reference';
}

export interface TechStackGroup {
  layer: string;
  tools: string[];
  justification: string;
}

export interface DiagramNode {
  id: string;
  label: string;
  layer: 'Ingestion' | 'Processing' | 'Modeling' | 'Serving' | 'Monitoring';
  detail: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label: string;
}

export interface ArchitectureDiagram {
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface RoadmapPhase {
  phase: string;
  duration: string;
  deliverables: string[];
  exitCriteria: string;
}

export interface CriticFinding {
  area: string;
  severity: 'Nominal' | 'Advisory' | 'Critical Fix Applied';
  observation: string;
  mitigation: string;
}

export interface CriticReport {
  overallAssessment: string;
  leakageChecksPassed: boolean;
  datasetAlignmentVerified: boolean;
  findings: CriticFinding[];
  refinementsApplied: string[];
}

export interface MlArchitectureBlueprint {
  title: string;
  mlTaskType: string;
  projectOverview: string;
  problemDefinition: string;
  objectives: string[];
  mlTaskIdentification: {
    primaryTask: string;
    learningParadigm: string;
    inputSchemaSummary: string;
    outputFormat: string;
    rationale: string;
  };
  datasetStrategy: {
    strategySummary: string;
    samplingAndSplitting: string;
    classBalanceAndCoverage: string;
    dataGovernanceNotes: string;
  };
  dataCollection: {
    primarySources: string[];
    ingestionCadence: string;
    schemaValidationRules: string[];
  };
  dataPreprocessing: {
    pipelineSteps: string[];
    missingValueStrategy: string;
    outlierAndNoiseHandling: string;
    scalingAndEncoding: string;
  };
  exploratoryDataAnalysis: {
    keyHypotheses: string[];
    statisticalChecks: string[];
    leakageAndBiasAudits: string[];
  };
  featureEngineering: {
    engineeredFeatures: string[];
    domainTransformations: string[];
    leakagePreventionGuardrails: string;
  };
  featureSelection: {
    selectionMethods: string[];
    expectedDimensionalityImpact: string;
    multicollinearityHandling: string;
  };
  candidateAlgorithms: CandidateAlgorithmRow[];
  modelSelectionJustification: string;
  trainingPipeline: {
    orchestrationSteps: string[];
    hyperparameterTuningStrategy: string;
    reproducibilityControls: string[];
  };
  evaluationMetrics: {
    primaryMetric: string;
    secondaryMetrics: string[];
    businessThresholdAlignment: string;
  };
  validationStrategy: {
    splittingProtocol: string;
    crossValidationConfig: string;
    errorAnalysisPlan: string;
  };
  systemArchitectureDiagram: ArchitectureDiagram;
  technologyStack: TechStackGroup[];
  deploymentStrategy: {
    servingPattern: string;
    infrastructureDesign: string;
    rolloutAndFallbackPlan: string;
  };
  monitoringAndMaintenance: {
    dataAndConceptDriftChecks: string[];
    performanceAlerts: string[];
    retrainingCadence: string;
  };
  implementationRoadmap: RoadmapPhase[];
  ragReferences: RagChunkReference[];
  criticReport: CriticReport;
  generatedAt: string;
}

export interface SavedProject {
  id: string;
  ownerId: string;
  title: string;
  prompt: string;
  mlTaskType: string;
  datasetId?: string;
  datasetName?: string;
  datasetSourceUrl?: string;
  clarifications?: ClarificationAnswer[];
  blueprint: MlArchitectureBlueprint;
  status: 'generated' | 'archived';
  createdAtMs: number;
  updatedAtMs: number;
}
