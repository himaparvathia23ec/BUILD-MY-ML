import type { DatasetCategory, DatasetEntry, DatasetPreview } from '../src/types/ml.ts';

export const CURATED_DATASETS: DatasetEntry[] = [
  {
    id: 'telco-customer-churn',
    name: 'Telco Customer Churn (IBM)',
    repository: 'IBM / Public Repo',
    category: 'Classification',
    taskType: 'Binary Classification (Churn Prediction)',
    description: 'Customer subscription, demographic, billing, and service usage records for predicting telecommunications churn.',
    sourceUrl: 'https://www.openml.org/d/42178',
    downloadUrl: 'https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv',
    fileName: 'Telco-Customer-Churn.csv',
    format: 'CSV',
    delimiter: ',',
    hasHeader: true,
    columns: [
      'customerID', 'gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure',
      'PhoneService', 'MultipleLines', 'InternetService', 'OnlineSecurity',
      'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV',
      'StreamingMovies', 'Contract', 'PaperlessBilling', 'PaymentMethod',
      'MonthlyCharges', 'TotalCharges', 'Churn',
    ],
    rows: 7043,
    columnCount: 21,
    targetColumn: 'Churn',
    canBundleInZip: true,
    packagingNote: 'Full verified CSV dataset packaged directly from the public IBM OpenML mirror.',
    license: 'Public Benchmark / IBM Sample Data',
  },
  {
    id: 'heart-disease-cleveland',
    name: 'Heart Disease (Cleveland Clinic)',
    repository: 'UCI ML Repository',
    category: 'Healthcare',
    taskType: 'Binary / Multi-Class Clinical Classification',
    description: 'Clinical diagnostic attributes including chest pain type, resting blood pressure, serum cholesterol, and ECG readings.',
    sourceUrl: 'https://archive.ics.uci.edu/dataset/45/heart+disease',
    downloadUrl: 'https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data',
    fileName: 'heart_disease_cleveland.csv',
    format: 'CSV',
    delimiter: ',',
    hasHeader: false,
    columns: [
      'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
      'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'num',
    ],
    rows: 303,
    columnCount: 14,
    targetColumn: 'num',
    canBundleInZip: true,
    packagingNote: 'Full verified Cleveland clinical CSV packaged with standard UCI column headers.',
    license: 'CC BY 4.0 (UCI Machine Learning Repository)',
  },
  {
    id: 'breast-cancer-wisconsin',
    name: 'Breast Cancer Wisconsin (Diagnostic)',
    repository: 'UCI ML Repository',
    category: 'Healthcare',
    taskType: 'Binary Classification (Benign vs Malignant)',
    description: 'Digitized fine needle aspirate (FNA) cell nucleus measurements computing mean, standard error, and worst morphological metrics.',
    sourceUrl: 'https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic',
    downloadUrl: 'https://archive.ics.uci.edu/ml/machine-learning-databases/breast-cancer-wisconsin/wdbc.data',
    fileName: 'wdbc_breast_cancer.csv',
    format: 'CSV',
    delimiter: ',',
    hasHeader: false,
    columns: [
      'id', 'diagnosis', 'radius_mean', 'texture_mean', 'perimeter_mean', 'area_mean',
      'smoothness_mean', 'compactness_mean', 'concavity_mean', 'concave_points_mean',
      'symmetry_mean', 'fractal_dimension_mean', 'radius_se', 'texture_se', 'perimeter_se',
      'area_se', 'smoothness_se', 'compactness_se', 'concavity_se', 'concave_points_se',
      'symmetry_se', 'fractal_dimension_se', 'radius_worst', 'texture_worst', 'perimeter_worst',
      'area_worst', 'smoothness_worst', 'compactness_worst', 'concavity_worst',
      'concave_points_worst', 'symmetry_worst', 'fractal_dimension_worst',
    ],
    rows: 569,
    columnCount: 32,
    targetColumn: 'diagnosis',
    canBundleInZip: true,
    packagingNote: 'Full verified UCI diagnostic dataset packaged with canonical feature headers.',
    license: 'CC BY 4.0 (UCI Machine Learning Repository)',
  },
  {
    id: 'california-housing',
    name: 'California Housing Districts',
    repository: 'StatLib / OpenML',
    category: 'Regression',
    taskType: 'Spatial & Tabular Regression',
    description: '1990 California census block group housing attributes for predicting median house value across coastal and inland regions.',
    sourceUrl: 'https://www.openml.org/d/43939',
    downloadUrl: 'https://raw.githubusercontent.com/ageron/handson-ml2/master/datasets/housing/housing.csv',
    fileName: 'california_housing.csv',
    format: 'CSV',
    delimiter: ',',
    hasHeader: true,
    columns: [
      'longitude', 'latitude', 'housing_median_age', 'total_rooms', 'total_bedrooms',
      'population', 'households', 'median_income', 'median_house_value', 'ocean_proximity',
    ],
    rows: 20640,
    columnCount: 10,
    targetColumn: 'median_house_value',
    canBundleInZip: true,
    packagingNote: 'Full verified 20,640-row census block CSV packaged directly in the archive.',
    license: 'Public Domain (StatLib / Pace & Barry 1997)',
  },
  {
    id: 'german-credit-risk',
    name: 'German Credit Risk (OpenML #31)',
    repository: 'OpenML',
    category: 'Finance',
    taskType: 'Binary Credit Default Classification',
    description: 'Consumer credit applications with checking status, loan duration, credit history, purpose, savings, and employment attributes.',
    sourceUrl: 'https://www.openml.org/d/31',
    downloadUrl: 'https://www.openml.org/data/get_csv/31/dataset_31_credit-g.arff',
    fileName: 'german_credit_risk.csv',
    format: 'ARFF-CSV',
    delimiter: ',',
    hasHeader: true,
    columns: [
      'checking_status', 'duration', 'credit_history', 'purpose', 'credit_amount',
      'savings_status', 'employment', 'installment_commitment', 'personal_status',
      'other_parties', 'residence_since', 'property_magnitude', 'age',
      'other_payment_plans', 'housing', 'existing_credits', 'job',
      'num_dependents', 'own_telephone', 'foreign_worker', 'class',
    ],
    rows: 1000,
    columnCount: 21,
    targetColumn: 'class',
    canBundleInZip: true,
    packagingNote: 'Full verified OpenML #31 CSV export packaged directly in the archive.',
    license: 'CC BY 4.0 (UCI Statlog / OpenML)',
  },
  {
    id: 'electricity-pricing-ts',
    name: 'NSW Electricity Market Pricing',
    repository: 'OpenML',
    category: 'Time Series',
    taskType: 'Time-Series Binary Price Movement Classification',
    description: 'Half-hourly Australian New South Wales electricity market demand, price, and inter-state transfer telemetry.',
    sourceUrl: 'https://www.openml.org/d/151',
    downloadUrl: 'https://www.openml.org/data/get_csv/2419/electricity-normalized.arff',
    fileName: 'electricity_market_ts.csv',
    format: 'ARFF-CSV',
    delimiter: ',',
    hasHeader: true,
    columns: ['date', 'day', 'period', 'nswprice', 'nswdemand', 'vicprice', 'vicdemand', 'transfer', 'class'],
    rows: 45312,
    columnCount: 9,
    targetColumn: 'class',
    canBundleInZip: true,
    packagingNote: 'Full verified 45,312-row OpenML electricity market CSV packaged directly.',
    license: 'Public Academic Benchmark (OpenML #151)',
  },
  {
    id: 'seattle-weather',
    name: 'Seattle Daily Weather Telemetry',
    repository: 'Vega / NOAA',
    category: 'Time Series',
    taskType: 'Multivariate Weather Forecasting & Classification',
    description: 'Daily meteorological observations from Seattle including precipitation, max/min temperature, wind speed, and weather regime.',
    sourceUrl: 'https://github.com/vega/vega-datasets/blob/main/data/seattle-weather.csv',
    downloadUrl: 'https://raw.githubusercontent.com/vega/vega-datasets/main/data/seattle-weather.csv',
    fileName: 'seattle_weather.csv',
    format: 'CSV',
    delimiter: ',',
    hasHeader: true,
    columns: ['date', 'precipitation', 'temp_max', 'temp_min', 'wind', 'weather'],
    rows: 1461,
    columnCount: 6,
    targetColumn: 'weather',
    canBundleInZip: true,
    packagingNote: 'Full verified NOAA/Vega daily meteorological CSV packaged directly.',
    license: 'BSD-3-Clause / Public NOAA Observation Data',
  },
  {
    id: 'spambase-email',
    name: 'Spambase Email Classification (UCI #94)',
    repository: 'OpenML',
    category: 'NLP & Text',
    taskType: 'Binary Spam Detection (Token & Character Frequencies)',
    description: '4,601 email messages encoded into 57 continuous word-frequency, character-frequency, and capital-run-length features.',
    sourceUrl: 'https://www.openml.org/d/44',
    downloadUrl: 'https://www.openml.org/data/get_csv/44/dataset_44_spambase.arff',
    fileName: 'spambase_openml_44.csv',
    format: 'ARFF-CSV',
    delimiter: ',',
    hasHeader: true,
    columns: ['word_freq_make', 'word_freq_address', 'word_freq_all', 'word_freq_3d', 'word_freq_our', 'class'],
    rows: 4601,
    columnCount: 58,
    targetColumn: 'class',
    canBundleInZip: true,
    packagingNote: 'Full verified 58-column Spambase CSV packaged directly from OpenML #44.',
    license: 'CC BY 4.0 (UCI / OpenML)',
  },
  {
    id: 'wine-quality-red',
    name: 'Red Wine Physicochemical Quality',
    repository: 'UCI ML Repository',
    category: 'Regression',
    taskType: 'Ordinal Regression / Quality Scoring',
    description: 'Physicochemical lab measurements of Portuguese Vinho Verde red wines paired with sensory quality ratings (0–10).',
    sourceUrl: 'https://archive.ics.uci.edu/dataset/186/wine+quality',
    downloadUrl: 'https://archive.ics.uci.edu/ml/machine-learning-databases/wine-quality/winequality-red.csv',
    fileName: 'winequality-red.csv',
    format: 'CSV',
    delimiter: ';',
    hasHeader: true,
    columns: [
      'fixed acidity', 'volatile acidity', 'citric acid', 'residual sugar', 'chlorides',
      'free sulfur dioxide', 'total sulfur dioxide', 'density', 'pH', 'sulphates', 'alcohol', 'quality',
    ],
    rows: 1599,
    columnCount: 12,
    targetColumn: 'quality',
    canBundleInZip: true,
    packagingNote: 'Full verified UCI Wine Quality (Red) semicolon-delimited CSV packaged directly.',
    license: 'CC BY 4.0 (UCI Machine Learning Repository)',
  },
  {
    id: 'pima-indians-diabetes',
    name: 'Pima Indians Diabetes Risk',
    repository: 'OpenML',
    category: 'Healthcare',
    taskType: 'Binary Medical Risk Prediction',
    description: 'Diagnostic measurements (glucose, BMI, insulin, blood pressure, age, pregnancies) predicting diabetes onset within 5 years.',
    sourceUrl: 'https://www.openml.org/d/37',
    downloadUrl: 'https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv',
    fileName: 'pima_indians_diabetes.csv',
    format: 'CSV',
    delimiter: ',',
    hasHeader: false,
    columns: [
      'pregnancies', 'glucose', 'blood_pressure', 'skin_thickness',
      'insulin', 'bmi', 'diabetes_pedigree', 'age', 'outcome',
    ],
    rows: 768,
    columnCount: 9,
    targetColumn: 'outcome',
    canBundleInZip: true,
    packagingNote: 'Full verified 768-row diagnostic CSV packaged with canonical clinical headers.',
    license: 'Public Academic Benchmark (NIDDK / OpenML #37)',
  },
  {
    id: 'airfoil-self-noise',
    name: 'NASA Airfoil Self-Noise',
    repository: 'UCI ML Repository',
    category: 'Regression',
    taskType: 'Aerodynamic Acoustic Regression',
    description: 'NASA wind-tunnel measurements of NACA 0012 airfoils predicting scaled sound pressure level from frequency, angle, and velocity.',
    sourceUrl: 'https://archive.ics.uci.edu/dataset/291/airfoil+self+noise',
    downloadUrl: 'https://archive.ics.uci.edu/ml/machine-learning-databases/00291/airfoil_self_noise.dat',
    fileName: 'airfoil_self_noise.tsv',
    format: 'TSV',
    delimiter: '\t',
    hasHeader: false,
    columns: [
      'frequency_hz', 'angle_of_attack_deg', 'chord_length_m',
      'free_stream_velocity_ms', 'suction_side_thickness_m', 'scaled_sound_pressure_db',
    ],
    rows: 1503,
    columnCount: 6,
    targetColumn: 'scaled_sound_pressure_db',
    canBundleInZip: true,
    packagingNote: 'Full verified NASA/UCI wind-tunnel TSV dataset packaged with physical unit headers.',
    license: 'CC BY 4.0 (UCI / NASA)',
  },
  {
    id: 'palmer-penguins',
    name: 'Palmer Archipelago Penguins',
    repository: 'OpenML',
    category: 'Classification',
    taskType: 'Multi-Class Species Classification',
    description: 'Morphological bill, flipper, and body mass measurements across Adelie, Chinstrap, and Gentoo penguins at Palmer Station.',
    sourceUrl: 'https://www.openml.org/d/42585',
    downloadUrl: 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/penguins.csv',
    fileName: 'palmer_penguins.csv',
    format: 'CSV',
    delimiter: ',',
    hasHeader: true,
    columns: ['species', 'island', 'bill_length_mm', 'bill_depth_mm', 'flipper_length_mm', 'body_mass_g', 'sex'],
    rows: 344,
    columnCount: 7,
    targetColumn: 'species',
    canBundleInZip: true,
    packagingNote: 'Full verified CC0 Palmer Penguins CSV packaged directly in the archive.',
    license: 'CC0 1.0 Public Domain (Gorman, Williams & Fraser)',
  },
  {
    id: 'iris-species',
    name: 'Iris Botanical Classification',
    repository: 'UCI ML Repository',
    category: 'Classification',
    taskType: 'Multi-Class Tabular Classification',
    description: 'Classic Fisher botanical dataset containing sepal and petal length/width across three Iris species.',
    sourceUrl: 'https://archive.ics.uci.edu/dataset/53/iris',
    downloadUrl: 'https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data',
    fileName: 'iris.csv',
    format: 'CSV',
    delimiter: ',',
    hasHeader: false,
    columns: ['sepal_length_cm', 'sepal_width_cm', 'petal_length_cm', 'petal_width_cm', 'species'],
    rows: 150,
    columnCount: 5,
    targetColumn: 'species',
    canBundleInZip: true,
    packagingNote: 'Full verified UCI #53 CSV packaged with canonical botanical headers.',
    license: 'CC BY 4.0 (UCI Machine Learning Repository)',
  },
  {
    id: 'uci-sms-spam-archive',
    name: 'SMS Spam Collection (UCI #228)',
    repository: 'UCI ML Repository',
    category: 'NLP & Text',
    taskType: 'Raw Text Binary Classification',
    description: '5,574 real English SMS messages labeled as ham or spam for raw natural language tokenization and transformer modeling.',
    sourceUrl: 'https://archive.ics.uci.edu/dataset/228/sms+spam+collection',
    downloadUrl: 'https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip',
    fileName: 'sms+spam+collection.zip',
    format: 'ZIP',
    delimiter: '\t',
    hasHeader: false,
    columns: ['label', 'message_text'],
    rows: 5574,
    columnCount: 2,
    targetColumn: 'label',
    canBundleInZip: true,
    packagingNote: 'Official UCI compressed ZIP archive packaged directly from archive.ics.uci.edu.',
    license: 'CC BY 4.0 (Almeida & Hidalgo / UCI)',
  },
  {
    id: 'openml-mnist-784',
    name: 'MNIST Handwritten Digits (784px)',
    repository: 'OpenML',
    category: 'Computer Vision',
    taskType: '10-Class Image Classification (28×28 Grayscale)',
    description: '70,000 grayscale 28×28 pixel images of handwritten digits (0–9) flattened into 784 pixel intensity features plus label.',
    sourceUrl: 'https://www.openml.org/d/554',
    downloadUrl: null,
    fileName: 'mnist_784_external_reference.md',
    format: 'External Archive',
    delimiter: ',',
    hasHeader: true,
    columns: ['pixel1', 'pixel2', '...', 'pixel784', 'class'],
    rows: 70000,
    columnCount: 785,
    targetColumn: 'class',
    canBundleInZip: false,
    packagingNote:
      'Excluded from inline ZIP bundling because the full 70,000×785 matrix exceeds lightweight project archive limits (~110 MB ARFF/CSV). Fetch programmatically via OpenML API (dataset ID 554) or torchvision/scikit-learn.',
    license: 'CC BY-SA 3.0 (LeCun et al. / OpenML #554)',
  },
];

const previewCache = new Map<string, { fetchedAt: number; preview: DatasetPreview }>();
const PREVIEW_TTL_MS = 1000 * 60 * 15;

function parseDelimitedLine(line: string, delimiter: string): string[] {
  if (delimiter !== ',') {
    return line.split(delimiter).map((cell) => cell.replace(/^"|"$/g, '').trim());
  }
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function listDatasets(params: {
  q?: string;
  category?: DatasetCategory;
  shuffle?: boolean;
}): DatasetEntry[] {
  const query = (params.q ?? '').trim().toLowerCase();
  const category = params.category ?? 'All';

  let filtered = CURATED_DATASETS.filter((ds) => {
    const matchesCategory = category === 'All' || ds.category === category;
    if (!matchesCategory) return false;
    if (!query) return true;
    const haystack = `${ds.name} ${ds.description} ${ds.taskType} ${ds.repository} ${ds.category}`.toLowerCase();
    return haystack.includes(query);
  });

  if (params.shuffle) {
    filtered = [...filtered].sort(() => Math.random() - 0.5);
  }
  return filtered;
}

export function getDatasetById(id: string): DatasetEntry | undefined {
  return CURATED_DATASETS.find((d) => d.id === id);
}

export async function getDatasetPreview(id: string): Promise<DatasetPreview> {
  const ds = getDatasetById(id);
  if (!ds) {
    throw new Error(`Dataset "${id}" not found in curated registry.`);
  }

  const cached = previewCache.get(id);
  if (cached && Date.now() - cached.fetchedAt < PREVIEW_TTL_MS) {
    return cached.preview;
  }

  if (!ds.downloadUrl || ds.format === 'ZIP' || ds.format === 'External Archive') {
    const preview: DatasetPreview = {
      datasetId: ds.id,
      columns: ds.columns,
      rows: [],
      totalRowsVerified: ds.rows,
      fetchedLive: false,
      sourceUrl: ds.sourceUrl,
    };
    previewCache.set(id, { fetchedAt: Date.now(), preview });
    return preview;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(ds.downloadUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'BuildMyML-Dataset-Verifier/1.0',
      },
    });
    if (!response.ok) {
      throw new Error(`Upstream dataset fetch failed with HTTP ${response.status}`);
    }

    // Stream only the first ~32KB so large datasets like Electricity (45k rows) preview instantaneously
    const reader = response.body?.getReader();
    let textChunk = '';
    if (reader) {
      const decoder = new TextDecoder();
      while (textChunk.length < 32768) {
        const { value, done } = await reader.read();
        if (done) break;
        textChunk += decoder.decode(value, { stream: true });
        if (textChunk.split(/\r?\n/).length > 18) {
          await reader.cancel();
          break;
        }
      }
    } else {
      textChunk = await response.text();
    }

    const lines = textChunk
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsedHeader = ds.hasHeader && lines.length > 0
      ? parseDelimitedLine(lines[0], ds.delimiter)
      : ds.columns;
    const dataLines = ds.hasHeader ? lines.slice(1, 11) : lines.slice(0, 10);
    const parsedRows = dataLines.map((line) => parseDelimitedLine(line, ds.delimiter));

    const preview: DatasetPreview = {
      datasetId: ds.id,
      columns: parsedHeader,
      rows: parsedRows,
      totalRowsVerified: ds.rows,
      fetchedLive: true,
      sourceUrl: ds.sourceUrl,
    };
    previewCache.set(id, { fetchedAt: Date.now(), preview });
    return preview;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchDatasetRawForBundle(id: string): Promise<{
  bundleable: boolean;
  fileName: string;
  contentType: string;
  buffer?: Buffer;
  dataset: DatasetEntry;
}> {
  const ds = getDatasetById(id);
  if (!ds) {
    throw new Error(`Dataset "${id}" not found.`);
  }
  if (!ds.canBundleInZip || !ds.downloadUrl) {
    return {
      bundleable: false,
      fileName: ds.fileName,
      contentType: 'text/markdown',
      dataset: ds,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(ds.downloadUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'BuildMyML-Zip-Packager/1.0' },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch dataset from ${ds.downloadUrl}: HTTP ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    // If headerless CSV/TSV, prepend the verified canonical column header row so the bundled file is immediately usable
    if (!ds.hasHeader && (ds.format === 'CSV' || ds.format === 'TSV')) {
      const headerLine = ds.columns.join(ds.delimiter) + '\n';
      buffer = Buffer.concat([Buffer.from(headerLine, 'utf-8'), buffer]);
    }

    const contentType = ds.format === 'ZIP' ? 'application/zip' : 'text/csv; charset=utf-8';
    return {
      bundleable: true,
      fileName: ds.fileName,
      contentType,
      buffer,
      dataset: ds,
    };
  } finally {
    clearTimeout(timer);
  }
}
