import type { PromptExample } from '../types/ml';

export const PROMPT_EXAMPLES: PromptExample[] = [
  // Category A: Quick / Non-detailed prompts
  {
    id: 'quick-churn',
    category: 'quick',
    title: 'Telecom Customer Churn Predictor',
    domain: 'SaaS & Telecom',
    prompt: 'Build a machine learning model to predict which telecom customers are likely to cancel their subscription next month.',
    recommendedDatasetId: 'telco-customer-churn',
  },
  {
    id: 'quick-heart',
    category: 'quick',
    title: 'Heart Disease Risk Screening',
    domain: 'Healthcare',
    prompt: 'Create an ML system to detect early heart disease risk from patient clinical test measurements.',
    recommendedDatasetId: 'heart-disease-cleveland',
  },
  {
    id: 'quick-housing',
    category: 'quick',
    title: 'Regional Housing Price Estimator',
    domain: 'Real Estate',
    prompt: 'Predict median house prices across California neighborhoods using census and location features.',
    recommendedDatasetId: 'california-housing',
  },
  {
    id: 'quick-spam',
    category: 'quick',
    title: 'Real-Time Email Spam Filter',
    domain: 'NLP & Security',
    prompt: 'Classify incoming email messages as spam or legitimate mail with low false-positive rate.',
    recommendedDatasetId: 'spambase-email',
  },
  {
    id: 'quick-credit',
    category: 'quick',
    title: 'Consumer Credit Default Scorer',
    domain: 'Finance',
    prompt: 'Score loan applicants for credit default risk using demographic and financial history.',
    recommendedDatasetId: 'german-credit-risk',
  },
  {
    id: 'quick-weather',
    category: 'quick',
    title: 'Daily Weather Regime Forecaster',
    domain: 'Time Series',
    prompt: 'Predict daily weather conditions from historical temperature, wind, and precipitation readings.',
    recommendedDatasetId: 'seattle-weather',
  },

  // Category B: Detailed prompts
  {
    id: 'detailed-telco-churn',
    category: 'detailed',
    title: 'Retention-Optimized Telecom Churn Platform',
    domain: 'Telecommunications',
    prompt:
      'Problem Statement: Our subscription telecom business experiences 26% annual customer attrition, driving high acquisition replacement costs. Retention teams have limited outreach budget and can only contact the top 15% highest-risk subscribers weekly.\n\nObjectives: Predict customer churn probability 30 days ahead, rank accounts by calibrated risk score, and surface per-customer SHAP reason codes so retention specialists can tailor contract or security add-on offers.\n\nData Requirements: Tabular subscriber records (~7,000+ accounts) combining tenure, contract type, payment method, add-on services (OnlineSecurity, TechSupport), and MonthlyCharges/TotalCharges, excluding non-predictive customerID keys.\n\nExpected Outcomes: Achieve >= 0.84 ROC-AUC and optimize PR-AUC / Recall@Top-15%, deployed as a containerized FastAPI scoring service with weekly batch CRM sync and monthly PSI feature drift monitoring.',
    recommendedDatasetId: 'telco-customer-churn',
  },
  {
    id: 'detailed-clinical-cancer',
    category: 'detailed',
    title: 'Explainable Breast Lesion Diagnostic Pipeline',
    domain: 'Clinical Oncology',
    prompt:
      'Problem Statement: Pathology teams reviewing digitized fine-needle aspirate (FNA) cell nucleus measurements need an objective decision-support tool to flag malignant breast masses while minimizing false negatives.\n\nObjectives: Build a high-sensitivity binary classifier with calibrated malignancy probabilities and local feature explanations for clinician review.\n\nData Requirements: 569 diagnostic FNA biopsy samples with 30 real-valued morphological features (mean, standard error, and worst radius, texture, perimeter, area, concavity, symmetry), strictly excluding patient IDs and handling strong feature multicollinearity.\n\nExpected Outcomes: Nested stratified cross-validation achieving >= 97% sensitivity (recall on malignant class), Brier-calibrated confidence scores, and an audit-ready inference API with strict schema validation.',
    recommendedDatasetId: 'breast-cancer-wisconsin',
  },
  {
    id: 'detailed-credit-underwriting',
    category: 'detailed',
    title: 'Regulated Credit Underwriting & Fairness Engine',
    domain: 'Consumer Banking',
    prompt:
      'Problem Statement: Retail credit analysts process 1,000+ consumer loan applications per quarter and must balance default loss prevention against regulatory explainability and demographic fairness requirements.\n\nObjectives: Develop an interpretable binary credit-risk scoring pipeline outputting probability of default (PD), adverse-action reason codes, and subgroup fairness diagnostics.\n\nData Requirements: Structured credit application records containing checking_status, loan duration, credit_history, credit_amount, savings_status, employment tenure, and housing status, with strict handling of mixed categorical/numeric columns and small-sample variance.\n\nExpected Outcomes: Calibrated probability predictions evaluated via cost-weighted F-beta and ROC-AUC, TreeSHAP local explanations, and shadow canary deployment before production cutover.',
    recommendedDatasetId: 'german-credit-risk',
  },
  {
    id: 'detailed-electricity-ts',
    category: 'detailed',
    title: 'Grid Demand & Electricity Price Regime Forecaster',
    domain: 'Energy & Utilities',
    prompt:
      'Problem Statement: Wholesale energy traders in the New South Wales electricity grid need short-horizon forecasts of half-hourly spot price direction (UP vs DOWN relative to 24-hour moving average) to hedge peak load spikes.\n\nObjectives: Build a leakage-free temporal classification pipeline using strictly backward-looking demand, inter-state transfer, and cyclical calendar features.\n\nData Requirements: 45,312 chronological half-hourly market telemetry rows covering nswprice, nswdemand, vicprice, vicdemand, transfer, day, and period.\n\nExpected Outcomes: Walk-forward chronological cross-validation preventing future look-ahead leakage, sub-25ms inference latency, and rolling 7-day concept drift alerting for seasonal demand shifts.',
    recommendedDatasetId: 'electricity-pricing-ts',
  },
  {
    id: 'detailed-housing-spatial',
    category: 'detailed',
    title: 'Geospatial California Housing Valuation System',
    domain: 'PropTech & Real Estate',
    prompt:
      'Problem Statement: Automated property valuation platforms require accurate district-level median home price estimates that capture non-linear coastal proximity and spatial neighborhood effects across California.\n\nObjectives: Train a spatial regression pipeline predicting median_house_value while quantifying prediction error in both dollar MAE and RMSE.\n\nData Requirements: 20,640 census block group records containing longitude, latitude, housing_median_age, total_rooms, total_bedrooms (with missing values), population, households, median_income, and categorical ocean_proximity.\n\nExpected Outcomes: Engineer ratio features (rooms_per_household, bedrooms_ratio) and spatial proximity clusters inside fold-isolated ColumnTransformers, validated via spatial/stratified income-bin splitting.',
    recommendedDatasetId: 'california-housing',
  },
  {
    id: 'detailed-airfoil-acoustics',
    category: 'detailed',
    title: 'NASA Airfoil Acoustic Noise Surrogate Model',
    domain: 'Aerospace Engineering',
    prompt:
      'Problem Statement: Wind-tunnel acoustic testing of NACA 0012 airfoils across varying Reynolds numbers and angles of attack is expensive and slow; aerodynamic engineers need a fast ML surrogate model to predict scaled sound pressure level (dB).\n\nObjectives: Train a high-precision continuous regression surrogate capturing non-linear interactions between frequency, angle of attack, chord length, free-stream velocity, and boundary layer displacement thickness.\n\nData Requirements: 1,503 NASA wind-tunnel test observations with 5 physical continuous inputs and 1 continuous acoustic target (scaled_sound_pressure_db).\n\nExpected Outcomes: Repeated 10-fold CV benchmarking Ridge/SVR vs Gradient Boosted Trees, residual heteroscedasticity diagnostics, and an interactive batch simulation endpoint for CAD design sweeps.',
    recommendedDatasetId: 'airfoil-self-noise',
  },
];
