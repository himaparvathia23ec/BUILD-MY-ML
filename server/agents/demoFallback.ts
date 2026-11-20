import type {
  ClarificationAnswer,
  DatasetEntry,
  MlArchitectureBlueprint,
  RagChunkReference,
  RequirementAnalysis,
} from '../../src/types/ml.ts';

export function isGeminiUnavailable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('GEMINI_API_KEY is not configured') ||
    message.includes('API key not valid') ||
    message.includes('401') ||
    message.includes('403') ||
    message.includes('PERMISSION_DENIED') ||
    message.includes('UNAUTHENTICATED') ||
    message.includes('billing') ||
    message.includes('free tier is not available')
  );
}

export function createDemoRequirements(params: {
  prompt: string;
  dataset?: DatasetEntry | null;
}): RequirementAnalysis {
  const prompt = params.prompt.toLowerCase();
  const dataset = params.dataset;
  let mlTaskType = 'Supervised Machine Learning';
  let dataModality: RequirementAnalysis['dataModality'] = 'tabular';
  let domain = 'General Machine Learning';
  let title = 'Production Machine Learning System';

  if (/churn|customer retention|subscription/.test(prompt)) {
    domain = 'Customer Analytics';
    mlTaskType = 'Binary Classification';
    title = dataset?.name ? `${dataset.name} Churn Prediction` : 'Customer Churn Prediction System';
  } else if (/fraud|credit risk|loan/.test(prompt)) {
    domain = 'Finance';
    mlTaskType = 'Binary Classification';
    title = dataset?.name ? `${dataset.name} Risk Model` : 'Risk Prediction System';
  } else if (/disease|medical|clinical|diagnos|health/.test(prompt)) {
    domain = 'Healthcare';
    mlTaskType = 'Binary or Multiclass Classification';
    title = dataset?.name ? `${dataset.name} Prediction Pipeline` : 'Clinical Decision-Support Model';
  } else if (/forecast|weather|time series|demand|electricity|stock/.test(prompt)) {
    domain = 'Time-Series Analytics';
    mlTaskType = 'Time-Series Forecasting';
    dataModality = 'time-series';
    title = 'Time-Series Forecasting System';
  } else if (/spam|sms|text|nlp|sentiment/.test(prompt)) {
    domain = 'Natural Language Processing';
    mlTaskType = 'Text Classification';
    dataModality = 'text';
    title = 'Text Classification System';
  } else if (/image|vision|digit|mnist|object/.test(prompt)) {
    domain = 'Computer Vision';
    mlTaskType = 'Image Classification';
    dataModality = 'vision';
    title = 'Computer Vision Classification System';
  } else if (/house|price|predict|regression/.test(prompt)) {
    domain = 'Regression Analytics';
    mlTaskType = 'Supervised Regression';
  }

  if (dataset) {
    mlTaskType = dataset.taskType.includes('Regression')
      ? 'Supervised Regression'
      : dataset.category === 'NLP & Text'
        ? 'Text Classification'
        : dataset.category === 'Computer Vision'
          ? 'Image Classification'
          : dataset.category === 'Time Series'
            ? 'Time-Series Classification'
            : mlTaskType;
  }

  const clarificationQuestions = [
    {
      id: 'deployment_mode',
      question: 'What is the primary deployment mode?',
      rationale: 'This determines whether inference should use a REST API or batch pipeline.',
      options: ['Real-time REST API', 'Scheduled batch scoring', 'Streaming inference'],
      allowCustom: true,
    },
    {
      id: 'error_priority',
      question: 'Which prediction error is more costly?',
      rationale: 'This guides threshold selection and the primary evaluation metric.',
      options: ['False negatives', 'False positives', 'Balanced precision and recall'],
      allowCustom: true,
    },
  ];

  return {
    suggestedTitle: title,
    domain,
    mlTaskType,
    dataModality,
    targetObjective: dataset
      ? `Predict ${dataset.targetColumn} using the verified ${dataset.name} dataset.`
      : `Deliver a production-grade ${mlTaskType.toLowerCase()} system for the stated prompt.`,
    deploymentTarget: 'REST API with optional scheduled batch scoring',
    latencyConstraint: 'Sub-second REST inference with 200 ms target after warm-up',
    scaleProfile: dataset
      ? `${dataset.rows.toLocaleString()} rows with ${dataset.columnCount} columns`
      : 'Enterprise tabular or domain-specific dataset scale',
    keyConstraints: [
      'Prevent data leakage and proxy-feature leakage',
      'Use stratified or chronological validation appropriate to the data',
      'Monitor drift, calibration, latency, and operational health',
    ],
    isUnderspecified: true,
    clarificationQuestions,
  };
}

export function createDemoBlueprint(params: {
  prompt: string;
  requirements: RequirementAnalysis;
  clarifications: ClarificationAnswer[];
  dataset?: DatasetEntry | null;
  ragReferences: RagChunkReference[];
}): Omit<MlArchitectureBlueprint, 'ragReferences' | 'criticReport' | 'generatedAt'> {
  const { requirements, dataset } = params;
  const isRegression = requirements.mlTaskType.toLowerCase().includes('regression');
  const isTimeSeries = requirements.dataModality === 'time-series';
  const primaryMetric = isRegression
    ? 'RMSE with MAE and R-squared'
    : 'PR-AUC with F1-Score and calibrated Brier score';
  const datasetSummary = dataset
    ? `${dataset.rows.toLocaleString()} verified rows across ${dataset.columnCount} columns in ${dataset.name}`
    : 'A domain-specific, versioned production dataset';
  const targetColumn = dataset?.targetColumn ?? 'the requested prediction target';
  const clarifications = params.clarifications.length
    ? params.clarifications.map((item) => item.answer).join('; ')
    : 'Smart defaults used because no custom clarification answers were provided';

  return {
    title: requirements.suggestedTitle,
    mlTaskType: requirements.mlTaskType,
    projectOverview: `A production-ready ${requirements.mlTaskType.toLowerCase()} architecture for ${requirements.domain}, grounded in the prompt, dataset metadata, and the retrieved ML engineering knowledge base.`,
    problemDefinition: `The project addresses: ${params.prompt.trim()}. The system predicts ${targetColumn} and exposes an auditable serving, monitoring, and retraining pipeline.`,
    objectives: [
      `Produce reliable ${targetColumn} predictions with out-of-sample validation.`,
      `Deploy ${requirements.deploymentTarget.toLowerCase()} with ${requirements.latencyConstraint.toLowerCase()}.`,
      'Detect drift and preserve evaluation integrity through dataset and model monitoring.',
    ],
    mlTaskIdentification: {
      primaryTask: requirements.mlTaskType,
      learningParadigm: 'Supervised learning',
      inputSchemaSummary: datasetSummary,
      outputFormat: isRegression
        ? 'Numeric prediction with confidence interval when supported'
        : 'Probability, calibrated class decision, and local feature attribution',
      rationale: `The problem is formulated as ${requirements.mlTaskType.toLowerCase()} based on the prompt and available dataset structure.`,
    },
    datasetStrategy: {
      strategySummary: dataset
        ? `Use the verified ${dataset.name} schema and live preview while adding a clearly labeled holdout set.`
        : 'Build a versioned ingestion source, schema contract, labeling process, and train/holdout governance.',
      samplingAndSplitting: isTimeSeries
        ? 'Use chronological expanding-window splits and preserve a final untouched test period.'
        : dataset && dataset.rows < 1500
          ? 'Use repeated stratified 5-fold cross-validation and a final nested holdout.'
          : 'Use a stratified time-aware 70/15/15 train-validation-test split.',
      classBalanceAndCoverage: isRegression
        ? 'Measure error slices across the target distribution and geographic or operational cohorts.'
        : 'Use stratified folds, class weights inside folds, and cost-sensitive threshold tuning.',
      dataGovernanceNotes: 'Separate PII, enforce retention policies, record provenance, and exclude identifiers and post-outcome fields.',
    },
    dataCollection: {
      primarySources: dataset
        ? [dataset.repository, 'Application database or event stream', 'Data quality and lineage store']
        : ['Primary business data source', 'Operational event stream', 'Label and feedback store'],
      ingestionCadence: 'Daily batch ingestion with optional event-driven updates',
      schemaValidationRules: [
        'Validate required columns and data types',
        'Reject or quarantine out-of-range values',
        'Record schema-version and source lineage',
      ],
    },
    dataPreprocessing: {
      pipelineSteps: [
        'Schema validation and identifier removal',
        'Fit-fold-only missing-value imputation',
        'Encoding and scaling inside a single scikit-learn pipeline',
        'Outlier review and target-safe feature assembly',
      ],
      missingValueStrategy: 'Median or iterative imputation for numerics and explicit missing categories for categoricals.',
      outlierAndNoiseHandling: 'Apply robust scaling and Winsorization only after train-fold statistics are estimated.',
      scalingAndEncoding: 'StandardScaler or RobustScaler plus OneHotEncoder or TargetEncoder fitted inside cross-validation folds.',
    },
    exploratoryDataAnalysis: {
      keyHypotheses: [
        'The selected features contain predictive signal for the requested target.',
        'Population shifts and class imbalance vary across meaningful operational segments.',
      ],
      statisticalChecks: [
        'Distribution checks and missingness analysis',
        'Correlation, multicollinearity, and target-separation review',
        'Slice-level error and subgroup bias analysis',
      ],
      leakageAndBiasAudits: [
        'Remove identifiers, post-outcome fields, and future observations',
        'Fit preprocessing only on training folds',
        'Audit subgroup representation and performance disparities',
      ],
    },
    featureEngineering: {
      engineeredFeatures: isTimeSeries
        ? ['Backward-looking lag features', 'Rolling window statistics', 'Calendar and seasonality encodings']
        : ['Domain-specific interaction features', 'Aggregate and ratio features', 'Missingness indicators'],
      domainTransformations: [
        'Transform skewed numeric inputs only with training-fitted transformers',
        'Encode categories consistently across training and serving',
      ],
      leakagePreventionGuardrails: 'Exclude future, post-outcome, and direct-identifier columns; fit all stateful transformations only on training partitions.',
    },
    featureSelection: {
      selectionMethods: ['Remove constant and identifier columns', 'Correlation and multicollinearity review', 'Cross-validated model importance'],
      expectedDimensionalityImpact: 'Reduce redundant features while retaining explainability and stable cross-validation performance.',
      multicollinearityHandling: 'Remove highly correlated proxies and review Variance Inflation Factor or permutation importance.',
    },
    candidateAlgorithms: isRegression
      ? [
          { algorithm: 'Regularized Linear Regression', family: 'Linear', strengths: 'Fast and interpretable.', tradeoffs: 'Limited nonlinear capacity.', computeCost: 'Low', interpretability: 'High', recommendedRole: 'Baseline Benchmark' },
          { algorithm: 'LightGBM Regressor', family: 'Gradient Boosted Trees', strengths: 'Strong tabular nonlinear performance.', tradeoffs: 'Requires tuning and drift monitoring.', computeCost: 'Medium', interpretability: 'Medium', recommendedRole: 'Primary Production' },
          { algorithm: 'Random Forest Regressor', family: 'Ensemble Trees', strengths: 'Robust nonlinear interactions.', tradeoffs: 'Higher serving memory and inference cost.', computeCost: 'Medium', interpretability: 'Medium', recommendedRole: 'Ensemble Challenger' },
          { algorithm: 'ElasticNet', family: 'Regularized Linear', strengths: 'Sparse and stable baseline.', tradeoffs: 'Assumes mostly additive relationships.', computeCost: 'Low', interpretability: 'High', recommendedRole: 'Interpretability Reference' },
        ]
      : [
          { algorithm: 'Logistic Regression', family: 'Linear', strengths: 'Fast and interpretable.', tradeoffs: 'Limited nonlinear interactions.', computeCost: 'Low', interpretability: 'High', recommendedRole: 'Baseline Benchmark' },
          { algorithm: 'LightGBM', family: 'Gradient Boosted Trees', strengths: 'Strong heterogeneous-tabular performance.', tradeoffs: 'Requires careful regularization.', computeCost: 'Medium', interpretability: 'Medium', recommendedRole: 'Primary Production' },
          { algorithm: 'XGBoost', family: 'Gradient Boosted Trees', strengths: 'Robust regularization and sparse-data support.', tradeoffs: 'Slower tuning than LightGBM.', computeCost: 'Medium', interpretability: 'Medium', recommendedRole: 'Ensemble Challenger' },
          { algorithm: 'Shallow Decision Tree', family: 'Tree', strengths: 'Transparent rules and fast serving.', tradeoffs: 'Lower standalone accuracy.', computeCost: 'Low', interpretability: 'High', recommendedRole: 'Interpretability Reference' },
        ],
    modelSelectionJustification: 'Benchmark a transparent baseline against LightGBM or a domain-appropriate challenger, selecting the model that wins on the primary metric without unacceptable calibration or serving cost.',
    trainingPipeline: {
      orchestrationSteps: ['Validate and version data', 'Run preprocessing and training pipeline', 'Track experiments and register the model', 'Deploy and monitor'],
      hyperparameterTuningStrategy: 'Use Optuna or equivalent nested cross-validation with early stopping and the primary business metric.',
      reproducibilityControls: ['Pinned dependencies', 'Fixed random seeds', 'Dataset and model lineage', 'Containerized serving'],
    },
    evaluationMetrics: {
      primaryMetric,
      secondaryMetrics: isRegression
        ? ['MAE', 'R-squared', 'prediction interval coverage']
        : ['F1-score', 'ROC-AUC', 'Brier score', 'calibration curve'],
      businessThresholdAlignment: 'Tune the decision threshold on held-out validation predictions to match the stated false-positive and false-negative cost priority.',
    },
    validationStrategy: {
      splittingProtocol: isTimeSeries
        ? 'Chronological expanding-window validation with a final untouched test period'
        : 'Stratified or grouped train, validation, and test partitions',
      crossValidationConfig: dataset && dataset.rows < 1500
        ? 'Repeated stratified 5-fold cross-validation'
        : '5-fold cross-validation inside the training partition',
      errorAnalysisPlan: 'Analyze errors by data segment, confidence band, input modality, and operational subgroup.',
    },
    systemArchitectureDiagram: {
      title: `${requirements.suggestedTitle} Architecture`,
      nodes: [
        { id: 'n1', label: 'Data Sources', layer: 'Ingestion', detail: 'Versioned source data and labels' },
        { id: 'n2', label: 'Validation Pipeline', layer: 'Processing', detail: 'Schema, quality, and leakage checks' },
        { id: 'n3', label: 'Feature Pipeline', layer: 'Processing', detail: 'Reusable preprocessing and feature assembly' },
        { id: 'n4', label: 'Training & Registry', layer: 'Modeling', detail: 'Cross-validation, tuning, and model registration' },
        { id: 'n5', label: 'REST or Batch Service', layer: 'Serving', detail: 'Packaged model and preprocessing pipeline' },
        { id: 'n6', label: 'Monitoring', layer: 'Monitoring', detail: 'Drift, quality, latency, and business metrics' },
      ],
      edges: [
        { from: 'n1', to: 'n2', label: 'Validated ingestion' },
        { from: 'n2', to: 'n3', label: 'Clean features' },
        { from: 'n3', to: 'n4', label: 'Training data' },
        { from: 'n4', to: 'n5', label: 'Registered artifact' },
        { from: 'n5', to: 'n6', label: 'Inference telemetry' },
        { from: 'n6', to: 'n4', label: 'Retraining trigger' },
      ],
    },
    technologyStack: [
      { layer: 'Ingestion', tools: ['PostgreSQL', 'Object storage', 'Apache Airflow'], justification: 'Provides durable storage and scheduled orchestration.' },
      { layer: 'Processing', tools: ['Pandas', 'Scikit-Learn', 'Great Expectations'], justification: 'Supports typed pipelines and automated data-quality checks.' },
      { layer: 'Modeling', tools: ['LightGBM', 'XGBoost', 'MLflow', 'Optuna'], justification: 'Supports efficient tabular modeling and experiment lineage.' },
      { layer: 'Serving', tools: ['FastAPI', 'Docker', 'Uvicorn'], justification: 'Provides portable REST or batch inference.' },
      { layer: 'Monitoring', tools: ['Evidently AI', 'Prometheus', 'Grafana'], justification: 'Tracks drift, latency, and production health.' },
    ],
    deploymentStrategy: {
      servingPattern: requirements.deploymentTarget,
      infrastructureDesign: 'Containerized service with health checks, autoscaling, secrets, and a model artifact registry.',
      rolloutAndFallbackPlan: 'Use shadow or staged rollout, retain the previous model, and rollback automatically on error or drift thresholds.',
    },
    monitoringAndMaintenance: {
      dataAndConceptDriftChecks: ['PSI and feature-distribution monitoring', 'Calibration and slice-performance monitoring'],
      performanceAlerts: ['Latency and error-rate alerts', 'Ground-truth metric decay alerts', 'Schema and data-quality alerts'],
      retrainingCadence: 'Monthly or trigger-based retraining after a drift or performance gate passes.',
    },
    implementationRoadmap: [
      { phase: 'Phase 1: Data and Validation', duration: '1-2 weeks', deliverables: ['Data inventory', 'Schema contracts', 'Baseline EDA'], exitCriteria: 'Training data passes quality and leakage gates.' },
      { phase: 'Phase 2: Modeling', duration: '2-3 weeks', deliverables: ['Baseline model', 'Candidate comparison', 'Registered model'], exitCriteria: 'Selected model exceeds the agreed validation target.' },
      { phase: 'Phase 3: Serving', duration: '1-2 weeks', deliverables: ['Containerized API or batch job', 'Model registry integration'], exitCriteria: 'Staging passes functional and latency tests.' },
      { phase: 'Phase 4: Operations', duration: '1-2 weeks', deliverables: ['Dashboards', 'Alerts', 'Retraining workflow'], exitCriteria: 'Monitoring and rollback procedures are verified.' },
    ],
  };
}
