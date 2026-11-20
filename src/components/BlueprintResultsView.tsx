import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileDown,
  FolderOpen,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import type { ClarificationAnswer, DatasetEntry, MlArchitectureBlueprint } from '../types/ml';
import { SystemArchitectureDiagram } from './SystemArchitectureDiagram';

interface BlueprintResultsViewProps {
  prompt: string;
  clarifications: ClarificationAnswer[];
  dataset: DatasetEntry | null;
  blueprint: MlArchitectureBlueprint;
  exportingPdf: boolean;
  exportingZip: boolean;
  onDownloadPdf: () => void;
  onDownloadZip: () => void;
  onReopenInWorkspace: () => void;
  onBackToWorkspace: () => void;
}

const TOC_ITEMS = [
  { id: 'sec-01', label: '01. Project Overview' },
  { id: 'sec-02', label: '02. Problem Definition' },
  { id: 'sec-03', label: '03. Objectives' },
  { id: 'sec-04', label: '04. ML Task Identification' },
  { id: 'sec-05', label: '05. Dataset Strategy' },
  { id: 'sec-06', label: '06. Data Collection' },
  { id: 'sec-07', label: '07. Data Preprocessing' },
  { id: 'sec-08', label: '08. Exploratory Data Analysis' },
  { id: 'sec-09', label: '09. Feature Engineering' },
  { id: 'sec-10', label: '10. Feature Selection' },
  { id: 'sec-11', label: '11. Candidate Algorithms' },
  { id: 'sec-12', label: '12. Model Justification' },
  { id: 'sec-13', label: '13. Training Pipeline' },
  { id: 'sec-14', label: '14. Evaluation Metrics' },
  { id: 'sec-15', label: '15. Validation Strategy' },
  { id: 'sec-16', label: '16. System Architecture' },
  { id: 'sec-17', label: '17. Technology Stack' },
  { id: 'sec-18', label: '18. Deployment Strategy' },
  { id: 'sec-19', label: '19. Monitoring & Maintenance' },
  { id: 'sec-20', label: '20. Implementation Roadmap' },
  { id: 'sec-audit', label: 'RAG & Critic Validation' },
];

export function BlueprintResultsView({
  prompt,
  clarifications,
  dataset,
  blueprint,
  exportingPdf,
  exportingZip,
  onDownloadPdf,
  onDownloadZip,
  onReopenInWorkspace,
  onBackToWorkspace,
}: BlueprintResultsViewProps) {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
      {/* Top Document Header & Export Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <button
            type="button"
            onClick={onBackToWorkspace}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Workspace</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onReopenInWorkspace}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Reopen in Editor</span>
            </button>

            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={exportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {exportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
              <span>{exportingPdf ? 'Rendering PDF...' : 'Download PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onDownloadZip}
              disabled={exportingZip}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {exportingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
              <span>{exportingZip ? 'Packaging ZIP...' : 'Download Project ZIP'}</span>
            </button>
          </div>
        </div>

        <div className="pt-5">
          <div className="text-xs font-medium text-slate-500 tabular-nums">
            {blueprint.mlTaskType} <span aria-hidden="true">·</span> Generated{' '}
            {new Date(blueprint.generatedAt).toLocaleString()}
            {dataset ? (
              <>
                {' '}
                <span aria-hidden="true">·</span> Dataset: {dataset.name}
              </>
            ) : null}
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900 balance-text">
            {blueprint.title}
          </h1>

          {/* Original Prompt & Clarifications Strip */}
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="text-[11px] font-semibold text-slate-500">Original Prompt</div>
            <p className="mt-1 text-sm text-slate-800 whitespace-pre-line leading-relaxed">{prompt}</p>
            {clarifications.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                <div className="text-[11px] font-semibold text-slate-500">Clarifications Applied</div>
                {clarifications.map((c) => (
                  <div key={c.questionId} className="text-xs text-slate-700">
                    <span className="font-medium">{c.question}</span>{' '}
                    <span className="text-blue-700">→ {c.answer}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Architecture Document Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sticky Document Outline */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20 bg-white border border-slate-200 rounded-xl p-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <h2 className="text-xs font-semibold text-slate-900 pb-2 border-b border-slate-100">
            Architecture Contents
          </h2>
          <nav className="mt-2 flex flex-col space-y-0.5" aria-label="Architecture sections">
            {TOC_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="px-2 py-1.5 text-xs text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors truncate"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* 20 Structured Architecture Sections */}
        <main className="lg:col-span-9 space-y-6">
          {/* 01 & 02 */}
          <section id="sec-01" className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">01. Project Overview</h2>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed max-w-prose">
                {blueprint.projectOverview}
              </p>
            </div>

            <div id="sec-02" className="pt-5 border-t border-slate-100">
              <h2 className="font-display text-lg font-semibold text-slate-900">02. Problem Definition</h2>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed max-w-prose">
                {blueprint.problemDefinition}
              </p>
            </div>

            <div id="sec-03" className="pt-5 border-t border-slate-100">
              <h2 className="font-display text-lg font-semibold text-slate-900">03. Objectives</h2>
              <ul className="mt-2.5 space-y-2 list-disc list-inside text-sm text-slate-700">
                {blueprint.objectives.map((obj, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            <div id="sec-04" className="pt-5 border-t border-slate-100">
              <h2 className="font-display text-lg font-semibold text-slate-900">04. ML Task Identification</h2>
              <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <dt className="text-xs font-medium text-slate-500">Primary Task</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{blueprint.mlTaskIdentification.primaryTask}</dd>
                </div>
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <dt className="text-xs font-medium text-slate-500">Learning Paradigm</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{blueprint.mlTaskIdentification.learningParadigm}</dd>
                </div>
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <dt className="text-xs font-medium text-slate-500">Input Schema Summary</dt>
                  <dd className="mt-1 text-slate-700">{blueprint.mlTaskIdentification.inputSchemaSummary}</dd>
                </div>
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <dt className="text-xs font-medium text-slate-500">Output Format</dt>
                  <dd className="mt-1 text-slate-700">{blueprint.mlTaskIdentification.outputFormat}</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{blueprint.mlTaskIdentification.rationale}</p>
            </div>
          </section>

          {/* 05 & 06: Dataset Strategy & Collection */}
          <section id="sec-05" className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">05. Dataset Strategy</h2>
              {dataset && (
                <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{dataset.name}</div>
                    <div className="text-xs text-slate-600 tabular-nums mt-0.5">
                      {dataset.repository} <span aria-hidden="true">·</span> {dataset.rows.toLocaleString()} rows ×{' '}
                      {dataset.columnCount} columns <span aria-hidden="true">·</span> Target:{' '}
                      <span className="font-mono">{dataset.targetColumn}</span>
                    </div>
                  </div>
                  <a
                    href={dataset.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    <span>Verify Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">{blueprint.datasetStrategy.strategySummary}</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                <div className="border-t border-slate-200 pt-3">
                  <div className="font-semibold text-slate-900">Sampling &amp; Splitting</div>
                  <p className="mt-1 leading-relaxed">{blueprint.datasetStrategy.samplingAndSplitting}</p>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="font-semibold text-slate-900">Class Balance &amp; Coverage</div>
                  <p className="mt-1 leading-relaxed">{blueprint.datasetStrategy.classBalanceAndCoverage}</p>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="font-semibold text-slate-900">Data Governance</div>
                  <p className="mt-1 leading-relaxed">{blueprint.datasetStrategy.dataGovernanceNotes}</p>
                </div>
              </div>
            </div>

            <div id="sec-06" className="pt-5 border-t border-slate-100">
              <h2 className="font-display text-lg font-semibold text-slate-900">06. Data Collection</h2>
              <p className="mt-2 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Ingestion Cadence:</span>{' '}
                {blueprint.dataCollection.ingestionCadence}
              </p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-semibold text-slate-800">Primary Sources</h3>
                  <ul className="mt-1.5 space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                    {blueprint.dataCollection.primarySources.map((src, i) => (
                      <li key={i}>{src}</li>
                    ))}
                  </ul>
                </div>
                <details className="bg-slate-50 border border-slate-200 rounded-lg p-3.5" open>
                  <summary className="text-xs font-semibold text-slate-900 cursor-pointer">
                    Schema Validation Rules ({blueprint.dataCollection.schemaValidationRules.length})
                  </summary>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                    {blueprint.dataCollection.schemaValidationRules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </details>
              </div>
            </div>
          </section>

          {/* 07, 08, 09, 10: Data Processing & Feature Pipeline */}
          <section id="sec-07" className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">07. Data Preprocessing</h2>
              <ol className="mt-2.5 space-y-1.5 text-sm text-slate-700 list-decimal list-inside">
                {blueprint.dataPreprocessing.pipelineSteps.map((step, i) => (
                  <li key={i} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <div className="font-semibold text-slate-900">Missing Value Strategy</div>
                  <p className="mt-1 text-slate-700 leading-relaxed">
                    {blueprint.dataPreprocessing.missingValueStrategy}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <div className="font-semibold text-slate-900">Outlier &amp; Noise Handling</div>
                  <p className="mt-1 text-slate-700 leading-relaxed">
                    {blueprint.dataPreprocessing.outlierAndNoiseHandling}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <div className="font-semibold text-slate-900">Scaling &amp; Encoding</div>
                  <p className="mt-1 text-slate-700 leading-relaxed">
                    {blueprint.dataPreprocessing.scalingAndEncoding}
                  </p>
                </div>
              </div>
            </div>

            <div id="sec-08" className="pt-5 border-t border-slate-100">
              <h2 className="font-display text-lg font-semibold text-slate-900">08. Exploratory Data Analysis</h2>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                <div>
                  <h3 className="font-semibold text-slate-900">Key Hypotheses</h3>
                  <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                    {blueprint.exploratoryDataAnalysis.keyHypotheses.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Statistical Checks</h3>
                  <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                    {blueprint.exploratoryDataAnalysis.statisticalChecks.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Leakage &amp; Bias Audits</h3>
                  <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                    {blueprint.exploratoryDataAnalysis.leakageAndBiasAudits.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div id="sec-09" className="pt-5 border-t border-slate-100">
              <h2 className="font-display text-lg font-semibold text-slate-900">09. Feature Engineering</h2>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Engineered Features</h3>
                  <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                    {blueprint.featureEngineering.engineeredFeatures.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Domain Transformations</h3>
                  <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                    {blueprint.featureEngineering.domainTransformations.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="font-semibold text-slate-900">Leakage Prevention Guardrails:</span>{' '}
                {blueprint.featureEngineering.leakagePreventionGuardrails}
              </p>
            </div>

            <div id="sec-10" className="pt-5 border-t border-slate-100">
              <h2 className="font-display text-lg font-semibold text-slate-900">10. Feature Selection</h2>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                {blueprint.featureSelection.selectionMethods.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="border-t border-slate-200 pt-2.5">
                  <span className="font-semibold text-slate-900">Expected Dimensionality Impact:</span>{' '}
                  {blueprint.featureSelection.expectedDimensionalityImpact}
                </div>
                <div className="border-t border-slate-200 pt-2.5">
                  <span className="font-semibold text-slate-900">Multicollinearity Handling:</span>{' '}
                  {blueprint.featureSelection.multicollinearityHandling}
                </div>
              </div>
            </div>
          </section>

          {/* 11 & 12: Candidate Algorithms Table & Model Selection Justification */}
          <section id="sec-11" className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">11. Candidate Algorithms</h2>
              <div className="mt-3 overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Algorithm</th>
                      <th className="py-2.5 px-3 font-semibold">Role</th>
                      <th className="py-2.5 px-3 font-semibold">Compute / Interp.</th>
                      <th className="py-2.5 px-3 font-semibold">Strengths</th>
                      <th className="py-2.5 px-3 font-semibold">Tradeoffs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {blueprint.candidateAlgorithms.map((algo, idx) => (
                      <tr key={idx} className="align-top hover:bg-slate-50/60">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{algo.algorithm}</div>
                          <div className="text-[11px] text-slate-500">{algo.family}</div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap font-medium text-blue-700">
                          {algo.recommendedRole}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-slate-600 tabular-nums">
                          {algo.computeCost} / {algo.interpretability}
                        </td>
                        <td className="py-3 px-3 text-slate-700 leading-relaxed min-w-[200px]">{algo.strengths}</td>
                        <td className="py-3 px-3 text-slate-600 leading-relaxed min-w-[200px]">{algo.tradeoffs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div id="sec-12" className="pt-5 border-t border-slate-100">
              <h2 className="font-display text-lg font-semibold text-slate-900">12. Model Selection Justification</h2>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed max-w-prose">
                {blueprint.modelSelectionJustification}
              </p>
            </div>
          </section>

          {/* 13, 14, 15: Training, Evaluation & Validation */}
          <section id="sec-13" className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">13. Training Pipeline</h2>
              <ol className="mt-2.5 space-y-1.5 text-sm text-slate-700 list-decimal list-inside">
                {blueprint.trainingPipeline.orchestrationSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Hyperparameter Tuning:</span>{' '}
                {blueprint.trainingPipeline.hyperparameterTuningStrategy}
              </p>
              <details className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                <summary className="text-xs font-semibold text-slate-900 cursor-pointer">
                  Reproducibility Controls ({blueprint.trainingPipeline.reproducibilityControls.length})
                </summary>
                <ul className="mt-2 space-y-1 text-xs text-slate-700 list-disc list-inside">
                  {blueprint.trainingPipeline.reproducibilityControls.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </details>
            </div>

            <div id="sec-14" className="pt-5 border-t border-slate-100">
              <h2 className="font-display text-lg font-semibold text-slate-900">14. Evaluation Metrics</h2>
              <div className="mt-2.5 bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="text-xs font-medium text-slate-500">Primary Optimization Metric</div>
                <div className="mt-1 text-base font-semibold text-slate-900">
                  {blueprint.evaluationMetrics.primaryMetric}
                </div>
                <div className="mt-2 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Secondary Metrics:</span>{' '}
                  {blueprint.evaluationMetrics.secondaryMetrics.join(' · ')}
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {blueprint.evaluationMetrics.businessThresholdAlignment}
                </p>
              </div>
            </div>

            <div id="sec-15" className="pt-5 border-t border-slate-100">
              <h2 className="font-display text-lg font-semibold text-slate-900">15. Validation Strategy</h2>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <div className="font-semibold text-slate-900">Splitting Protocol</div>
                  <p className="mt-1 leading-relaxed">{blueprint.validationStrategy.splittingProtocol}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <div className="font-semibold text-slate-900">Cross-Validation Config</div>
                  <p className="mt-1 leading-relaxed">{blueprint.validationStrategy.crossValidationConfig}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <div className="font-semibold text-slate-900">Error Analysis Plan</div>
                  <p className="mt-1 leading-relaxed">{blueprint.validationStrategy.errorAnalysisPlan}</p>
                </div>
              </div>
            </div>
          </section>

          {/* 16: System Architecture Diagram */}
          <section id="sec-16" className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-slate-900">16. System Architecture Diagram</h2>
            <SystemArchitectureDiagram diagram={blueprint.systemArchitectureDiagram} />
          </section>

          {/* 17, 18, 19, 20: Stack, Deployment, Monitoring, Roadmap */}
          <section id="sec-17" className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">17. Technology Stack</h2>
              <div className="mt-3 overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Layer</th>
                      <th className="py-2.5 px-3 font-semibold">Selected Tools</th>
                      <th className="py-2.5 px-3 font-semibold">Architectural Justification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {blueprint.technologyStack.map((grp, i) => (
                      <tr key={i} className="align-top">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">{grp.layer}</td>
                        <td className="py-2.5 px-3 font-mono text-blue-700 min-w-[180px]">{grp.tools.join(', ')}</td>
                        <td className="py-2.5 px-3 text-slate-700 leading-relaxed">{grp.justification}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div id="sec-18" className="pt-5 border-t border-slate-100">
              <h2 className="font-display text-lg font-semibold text-slate-900">18. Deployment Strategy</h2>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <div className="font-semibold text-slate-900">Serving Pattern</div>
                  <p className="mt-1 leading-relaxed">{blueprint.deploymentStrategy.servingPattern}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <div className="font-semibold text-slate-900">Infrastructure Design</div>
                  <p className="mt-1 leading-relaxed">{blueprint.deploymentStrategy.infrastructureDesign}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <div className="font-semibold text-slate-900">Rollout &amp; Fallback Plan</div>
                  <p className="mt-1 leading-relaxed">{blueprint.deploymentStrategy.rolloutAndFallbackPlan}</p>
                </div>
              </div>
            </div>

            <div id="sec-19" className="pt-5 border-t border-slate-100">
              <h2 className="font-display text-lg font-semibold text-slate-900">19. Monitoring and Maintenance</h2>
              <p className="mt-2 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Retraining Cadence:</span>{' '}
                {blueprint.monitoringAndMaintenance.retrainingCadence}
              </p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                <div>
                  <h3 className="font-semibold text-slate-900">Data &amp; Concept Drift Checks</h3>
                  <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                    {blueprint.monitoringAndMaintenance.dataAndConceptDriftChecks.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Performance Alerts</h3>
                  <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                    {blueprint.monitoringAndMaintenance.performanceAlerts.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div id="sec-20" className="pt-5 border-t border-slate-100">
              <h2 className="font-display text-lg font-semibold text-slate-900">20. Implementation Roadmap</h2>
              <div className="mt-3 space-y-3">
                {blueprint.implementationRoadmap.map((phase, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{phase.phase}</h3>
                      <span className="font-mono text-xs text-slate-500 tabular-nums">{phase.duration}</span>
                    </div>
                    <ul className="mt-2 space-y-1 text-xs text-slate-700 list-disc list-inside">
                      {phase.deliverables.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">Exit Criteria:</span> {phase.exitCriteria}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RAG Grounding & Critic Validation Audit */}
          <section id="sec-audit" className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Critic Agent Validation &amp; RAG Grounding
              </h2>
              <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
                {blueprint.criticReport.overallAssessment}
              </p>
              <div className="mt-3 flex flex-wrap gap-6 text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                  {blueprint.criticReport.leakageChecksPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>
                    Leakage Audit: {blueprint.criticReport.leakageChecksPassed ? 'Passed' : 'Requires Attention'}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                  {blueprint.criticReport.datasetAlignmentVerified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>
                    Dataset Alignment:{' '}
                    {blueprint.criticReport.datasetAlignmentVerified ? 'Verified' : 'Custom Scope'}
                  </span>
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {blueprint.criticReport.findings.map((finding, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-3.5 text-xs space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{finding.area}</span>
                    <span
                      className={`font-medium ${
                        finding.severity === 'Nominal'
                          ? 'text-emerald-700'
                          : finding.severity === 'Advisory'
                          ? 'text-amber-700'
                          : 'text-blue-700'
                      }`}
                    >
                      {finding.severity}
                    </span>
                  </div>
                  <p className="text-slate-700">{finding.observation}</p>
                  <p className="text-slate-500">
                    <span className="font-medium text-slate-700">Mitigation:</span> {finding.mitigation}
                  </p>
                </div>
              ))}
            </div>

            <details className="border border-slate-200 rounded-lg p-4 bg-slate-50/70">
              <summary className="text-xs font-semibold text-slate-900 cursor-pointer">
                Retrieved RAG Knowledge Patterns ({blueprint.ragReferences.length})
              </summary>
              <div className="mt-3 space-y-3">
                {blueprint.ragReferences.map((ref) => (
                  <div key={ref.id} className="text-xs border-t border-slate-200 pt-2.5 first:border-t-0 first:pt-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-slate-900">{ref.title}</span>
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                        {ref.category} · Score {ref.relevanceScore}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-600 leading-relaxed">{ref.summary}</p>
                  </div>
                ))}
              </div>
            </details>
          </section>
        </main>
      </div>
    </div>
  );
}
