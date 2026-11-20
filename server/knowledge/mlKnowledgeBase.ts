export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  tags: string[];
  modalities: Array<'tabular' | 'text' | 'time-series' | 'vision' | 'multimodal'>;
  content: string;
  applicabilityNote: string;
}

export const ML_KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: 'kb-tabular-gbdt-vs-nn',
    title: 'Gradient Boosted Trees vs Deep Tabular Networks',
    category: 'Modeling & Algorithms',
    tags: ['tabular', 'classification', 'regression', 'xgboost', 'lightgbm', 'catboost', 'churn', 'credit', 'diabetes'],
    modalities: ['tabular'],
    content:
      'On heterogeneous tabular datasets (100 to 500k rows) with mixed numerical and categorical columns, LightGBM, XGBoost, and CatBoost consistently outperform standard MLPs in predictive accuracy, calibration stability, and training speed. Use CatBoost when high-cardinality categoricals dominate; LightGBM for fast histogram splits on >10k rows; Logistic Regression or Ridge as an interpretable linear baseline.',
    applicabilityNote: 'Grounds candidate algorithm selection and linear baseline benchmarking for tabular tasks.',
  },
  {
    id: 'kb-imbalanced-classification',
    title: 'Class Imbalance, Cost-Sensitive Learning & Threshold Calibration',
    category: 'Evaluation & Validation',
    tags: ['imbalance', 'churn', 'fraud', 'medical', 'clinical', 'precision', 'recall', 'pr-auc', 'f1', 'roc-auc', 'smote'],
    modalities: ['tabular', 'text', 'time-series'],
    content:
      'For skewed binary outcomes (churn, fraud, disease screening), accuracy is misleading. Optimize PR-AUC, F-beta, and calibrated probability Brier score. Apply stratified K-fold cross-validation, compute class weights (scale_pos_weight) inside each fold only—never apply SMOTE before splitting to avoid synthetic leakage—and tune decision thresholds on out-of-fold validation predictions using precision-recall cost curves.',
    applicabilityNote: 'Prevents synthetic oversampling data leakage and aligns evaluation metrics with imbalanced cost matrices.',
  },
  {
    id: 'kb-leakage-prevention',
    title: 'Pipeline Isolation & Feature Leakage Prevention',
    category: 'Preprocessing & Data Integrity',
    tags: ['leakage', 'preprocessing', 'pipeline', 'scaler', 'imputer', 'encoding', 'scikit-learn', 'validation'],
    modalities: ['tabular', 'time-series', 'text'],
    content:
      'All stateful transformers (SimpleImputer, StandardScaler, RobustScaler, TargetEncoder, PCA, TF-IDF) must fit exclusively on the training partition inside a scikit-learn Pipeline or ColumnTransformer, then transform validation and test folds. Exclude post-outcome proxy identifiers (e.g., customerID, discharge timestamps, future billing totals) during feature selection.',
    applicabilityNote: 'Enforces fold-isolated preprocessing pipelines and target-leakage column audits.',
  },
  {
    id: 'kb-small-dataset-regularization',
    title: 'Small-Sample Regime (<1,500 Rows) Validation & Variance Control',
    category: 'Validation Strategy',
    tags: ['small', 'clinical', 'healthcare', 'diagnostic', 'uci', 'nested-cv', 'regularization', 'variance', 'heart', 'breast', 'iris', 'penguins'],
    modalities: ['tabular'],
    content:
      'When sample size is below 1,500 rows (common in clinical and scientific cohorts), a single 80/20 split yields high evaluation variance. Use Repeated Stratified K-Fold (e.g., 5x5) or Nested Cross-Validation for unbiased hyperparameter tuning, restrict tree depth (max_depth <= 4) or apply L1/L2 penalties, and benchmark regularized linear/SVM models alongside shallow ensembles.',
    applicabilityNote: 'Shapes cross-validation protocol and complexity regularization for compact datasets.',
  },
  {
    id: 'kb-regression-diagnostics',
    title: 'Continuous Target Transformations & Spatial/Residual Diagnostics',
    category: 'Regression Modeling',
    tags: ['regression', 'housing', 'spatial', 'skew', 'rmse', 'mae', 'mape', 'residuals', 'quantile', 'acoustics'],
    modalities: ['tabular'],
    content:
      'Inspect target skewness before fitting squared-error losses; apply log1p or Yeo-Johnson target transforms when right-skewed (prices, income, counts). Report RMSE alongside MAE and R-squared so extreme errors and median error are both transparent. For spatial coordinates (lat/long), engineer distance-to-centroid/cluster features and evaluate spatial block cross-validation to detect geographic leakage.',
    applicabilityNote: 'Guides target transformation, dual RMSE/MAE reporting, and spatial splitting checks.',
  },
  {
    id: 'kb-time-series-splitting',
    title: 'Temporal Ordering, Lag Features & Walk-Forward Validation',
    category: 'Time Series & Forecasting',
    tags: ['time-series', 'forecasting', 'weather', 'electricity', 'pricing', 'demand', 'temporal', 'lag', 'rolling', 'walk-forward'],
    modalities: ['time-series', 'tabular'],
    content:
      'Random K-Fold violates causality on time-indexed telemetry. Enforce chronological train/validation/test splits and Expanding or Sliding Window Walk-Forward Cross-Validation. Engineer strictly backward-looking lag features, rolling mean/std windows, and cyclical Fourier/sin-cos calendar encodings (hour, day-of-week, month) with explicit purge gaps when multi-step horizons overlap.',
    applicabilityNote: 'Eliminates look-ahead bias in time-series feature engineering and cross-validation.',
  },
  {
    id: 'kb-nlp-text-pipelines',
    title: 'Text Classification Architecture: Subword Transformers vs Sparse N-Grams',
    category: 'NLP & Text',
    tags: ['nlp', 'text', 'spam', 'sms', 'sentiment', 'classification', 'tfidf', 'transformer', 'distilbert', 'embeddings'],
    modalities: ['text', 'tabular'],
    content:
      'Benchmark a fast TF-IDF (word + character n-grams) + LinearSVC/LogisticRegression pipeline first; on short messages (<128 tokens) with under 20k samples it often reaches 97%+ accuracy at sub-millisecond CPU latency. Upgrade to fine-tuned DistilBERT or DeBERTa-v3-small when semantic nuance, negation, or multilingual context justifies GPU inference.',
    applicabilityNote: 'Establishes latency-vs-accuracy baseline discipline for text and spam/intent tasks.',
  },
  {
    id: 'kb-vision-cnn-transfer',
    title: 'Computer Vision Transfer Learning & Edge Optimization',
    category: 'Computer Vision',
    tags: ['vision', 'image', 'mnist', 'cnn', 'resnet', 'efficientnet', 'vit', 'augmentation', 'onnx', 'classification'],
    modalities: ['vision'],
    content:
      'Use pretrained backbones (MobileNetV3 / ConvNeXt-Tiny / ResNet-18) for natural imagery, or compact depthwise-separable CNNs for 28x28 grayscale inputs like MNIST where massive backbones over-parameterize the manifold. Apply label-preserving augmentations (random affine, slight contrast jitter—avoid vertical flips on digits like 6/9!) and export to ONNX Runtime for deterministic CPU/GPU serving.',
    applicabilityNote: 'Guides backbone sizing, domain-safe augmentations, and ONNX runtime export for vision.',
  },
  {
    id: 'kb-explainability-shap',
    title: 'Model Explainability & Regulated Decision Auditing (SHAP / Partial Dependence)',
    category: 'Governance & Explainability',
    tags: ['healthcare', 'finance', 'credit', 'clinical', 'shap', 'explainability', 'fairness', 'calibration', 'audit'],
    modalities: ['tabular', 'text'],
    content:
      'High-stakes finance (credit underwriting) and healthcare diagnostics require both global feature attributions (TreeSHAP summary plots) and local per-prediction reason codes, alongside subgroup parity audits (demographic parity / equalized odds) and monotonic constraints on risk factors where domain policy demands.',
    applicabilityNote: 'Adds regulatory explainability, probability calibration, and fairness audit controls.',
  },
  {
    id: 'kb-feature-selection-multicollinearity',
    title: 'Multicollinearity Reduction & Permutation Importance Selection',
    category: 'Feature Selection',
    tags: ['multicollinearity', 'vif', 'correlation', 'permutation', 'rfe', 'shap', 'dimensionality', 'wdbc', 'spambase'],
    modalities: ['tabular'],
    content:
      'Wide numeric feature spaces (e.g., 30+ morphological or 57+ token frequency columns) exhibit strong inter-feature correlation. Combine Spearman hierarchical clustering / VIF pruning with out-of-fold Permutation Importance or Boruta/RFECV rather than greedy impurity importance, which biases toward high-cardinality continuous features.',
    applicabilityNote: 'Prevents redundant correlated features from inflating variance or distorting feature attribution.',
  },
  {
    id: 'kb-mlops-serving-patterns',
    title: 'Production Serving Patterns: Real-Time REST/ONNX vs Batch Scoring',
    category: 'Deployment & Serving',
    tags: ['deployment', 'fastapi', 'onnx', 'docker', 'batch', 'latency', 'api', 'serving', 'kubernetes'],
    modalities: ['tabular', 'text', 'time-series', 'vision'],
    content:
      'Match serving topology to latency SLA: use FastAPI + Uvicorn + ONNX Runtime or Treelite inside a slim containerized worker for <50ms online scoring, or scheduled Airflow/Prefect batch inference writing scored tables to Parquet/Postgres for daily CRM churn or credit batch workflows. Always co-package the exact fitted preprocessing pipeline with the model artifact in MLflow.',
    applicabilityNote: 'Aligns serving architecture and artifact packaging with real-time vs batch SLA needs.',
  },
  {
    id: 'kb-drift-monitoring-retraining',
    title: 'Production Drift Telemetry & Automated Retraining Triggers',
    category: 'Monitoring & Maintenance',
    tags: ['monitoring', 'drift', 'psi', 'evidently', 'retraining', 'latency', 'observability', 'maintenance'],
    modalities: ['tabular', 'text', 'time-series', 'vision'],
    content:
      'Monitor both upstream input covariance drift (Population Stability Index / Kolmogorov-Smirnov / Wasserstein distance via Evidently or WhyLogs) and downstream prediction score drift alongside delayed ground-truth metric decay. Configure shadow canary rollouts and automated retraining triggers only after schema validation gates (Pandera/Great Expectations) pass.',
    applicabilityNote: 'Establishes actionable PSI/KS drift thresholds and safe retraining governance.',
  },
];
