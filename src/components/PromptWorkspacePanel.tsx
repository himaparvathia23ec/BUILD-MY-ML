import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Eye,
  Loader2,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  ClarificationAnswer,
  ClarificationQuestion,
  DatasetEntry,
  RequirementAnalysis,
} from '../types/ml';

export type GenerationStage = 'idle' | 'analyzing' | 'clarifying' | 'requirement' | 'rag' | 'generator' | 'critic';

interface PromptWorkspacePanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onClear: () => void;
  selectedDataset: DatasetEntry | null;
  onClearDataset: () => void;
  onPreviewDataset: (dataset: DatasetEntry) => void;
  stage: GenerationStage;
  stageMessage: string;
  error: string | null;
  pendingRequirements: RequirementAnalysis | null;
  clarificationQuestions: ClarificationQuestion[];
  onSubmitPrompt: () => void;
  onSubmitClarifications: (answers: ClarificationAnswer[]) => void;
  onSkipClarifications: () => void;
}

const PIPELINE_STEPS: Array<{ key: GenerationStage; label: string }> = [
  { key: 'requirement', label: 'Requirement Agent' },
  { key: 'rag', label: 'RAG Knowledge Retrieval' },
  { key: 'generator', label: 'Blueprint Generator (20 Sections)' },
  { key: 'critic', label: 'Critic Validation & Audit' },
];

export function PromptWorkspacePanel({
  prompt,
  onPromptChange,
  onClear,
  selectedDataset,
  onClearDataset,
  onPreviewDataset,
  stage,
  stageMessage,
  error,
  pendingRequirements,
  clarificationQuestions,
  onSubmitPrompt,
  onSubmitClarifications,
  onSkipClarifications,
}: PromptWorkspacePanelProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [placeholder, setPlaceholder] = useState('');

  useEffect(() => {
    if (prompt || stage !== 'idle') {
      setPlaceholder('');
      return;
    }
    const hint =
      'Example: Build a customer churn prediction system for a subscription telecom service with 30-day advance warning, calibrated risk probabilities, SHAP explanations for retention teams, and weekly batch scoring...';
    let index = 0;
    let timeout: number | undefined;
    const typeHint = () => {
      index = Math.min(index + 1, hint.length);
      setPlaceholder(hint.slice(0, index));
      if (index < hint.length) timeout = window.setTimeout(typeHint, 24);
    };
    timeout = window.setTimeout(typeHint, 450);
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [prompt, stage]);

  const isGenerating =
    stage === 'analyzing' ||
    stage === 'requirement' ||
    stage === 'rag' ||
    stage === 'generator' ||
    stage === 'critic';

  const currentStepIndex = PIPELINE_STEPS.findIndex((s) => s.key === stage);
  const isClarifying = stage === 'clarifying';

  const handleConfirmClarifications = () => {
    const answers: ClarificationAnswer[] = clarificationQuestions.map((q) => {
      const custom = (customAnswers[q.id] ?? '').trim();
      const chosen = selectedAnswers[q.id] ?? q.options[0] ?? 'Standard production default';
      return {
        questionId: q.id,
        question: q.question,
        answer: custom || chosen,
      };
    });
    onSubmitClarifications(answers);
  };

  return (
    <section className={`prototype-panel prototype-center-panel workspace-glow bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-5 h-full ${isClarifying ? 'is-clarifying' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900 balance-text">
            ML Architecture Workspace
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Describe your machine learning goal—short concept or full technical brief—and optionally bind a verified public dataset.
          </p>
        </div>
      </div>

      {/* Selected Dataset Indicator */}
      <div className="border border-slate-200 rounded-lg bg-slate-50/70 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Database className={`w-4 h-4 shrink-0 ${selectedDataset ? 'text-blue-600' : 'text-slate-400'}`} />
          {selectedDataset ? (
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">{selectedDataset.name}</div>
              <div className="text-[11px] text-slate-500 tabular-nums truncate">
                {selectedDataset.repository} <span aria-hidden="true">·</span>{' '}
                {selectedDataset.rows.toLocaleString()} rows × {selectedDataset.columnCount} cols{' '}
                <span aria-hidden="true">·</span> Target: {selectedDataset.targetColumn}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              No dataset bound yet. Select one from the Random Dataset Explorer or generate a custom collection strategy.
            </div>
          )}
        </div>

        {selectedDataset && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onPreviewDataset(selectedDataset)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={onClearDataset}
              aria-label="Detach selected dataset"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        )}
      </div>

      {/* Multiline Prompt Editor */}
      <div className="prototype-prompt-editor flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="ml-prompt-editor" className="text-xs font-semibold text-slate-700">
            Project Prompt &amp; Requirements
          </label>
          <span className="text-[11px] text-slate-400 tabular-nums">{prompt.length} / 8,000 chars</span>
        </div>
        <textarea
          id="ml-prompt-editor"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={isGenerating}
          rows={11}
          maxLength={8000}
          placeholder={placeholder}
          className="w-full flex-1 min-h-[240px] rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 disabled:bg-slate-50 disabled:text-slate-500 resize-y"
        />
      </div>

      {/* Interactive Clarification Panel (shown when Clarification Agent flags brief prompt) */}
      {isClarifying && clarificationQuestions.length > 0 && (
        <div className="border border-blue-200 bg-blue-50/40 rounded-lg p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Clarification Agent Questions</h3>
              <p className="mt-0.5 text-xs text-slate-600">
                Your prompt for <span className="font-medium text-slate-800">{pendingRequirements?.suggestedTitle}</span> is brief. Answer below to tailor the 20-section blueprint, or proceed with defaults.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {clarificationQuestions.map((q) => {
              const currentChoice = selectedAnswers[q.id] ?? q.options[0] ?? '';
              return (
                <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2">
                  <div className="text-xs font-semibold text-slate-900">{q.question}</div>
                  <div className="text-[11px] text-slate-500">{q.rationale}</div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {q.options.map((opt) => {
                      const active = currentChoice === opt && !(customAnswers[q.id] ?? '').trim();
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt }));
                            setCustomAnswers((prev) => ({ ...prev, [q.id]: '' }));
                          }}
                          className={`px-2.5 py-1.5 text-xs rounded-md border transition-colors cursor-pointer ${
                            active
                              ? 'bg-blue-600 text-white border-blue-600 font-medium'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {q.allowCustom && (
                    <input
                      type="text"
                      value={customAnswers[q.id] ?? ''}
                      onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Or specify custom requirement..."
                      className="w-full mt-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onSkipClarifications}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Skip &amp; Use Smart Defaults
            </button>
            <button
              type="button"
              onClick={handleConfirmClarifications}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              Generate Blueprint with Clarifications
            </button>
          </div>
        </div>
      )}

      {/* Real-time Server SSE Multi-Agent Progress */}
      {isGenerating && (
        <div className="border border-slate-200 bg-slate-50 rounded-lg p-4 space-y-3" aria-live="polite">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
            <span>{stageMessage || 'Running multi-agent ML architecture pipeline...'}</span>
          </div>

          {stage !== 'analyzing' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PIPELINE_STEPS.map((step, idx) => {
                const isDone = currentStepIndex > idx;
                const isActive = currentStepIndex === idx;
                return (
                  <div
                    key={step.key}
                    className={`prototype-stage flex items-center gap-2 px-3 py-2 rounded-md border text-xs ${
                      isActive
                        ? 'prototype-stage-active bg-indigo-50 border-indigo-300 text-slate-900 font-medium'
                        : isDone
                        ? 'prototype-stage-complete bg-white border-emerald-200 text-emerald-700'
                        : 'prototype-stage-waiting bg-slate-100/60 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className="truncate">{step.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="border border-red-200 bg-red-50 rounded-lg px-4 py-3 flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Workspace Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={onClear}
          disabled={isGenerating || (!prompt && !selectedDataset)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Input</span>
        </button>

        <button
          type="button"
          onClick={onSubmitPrompt}
          disabled={isGenerating || prompt.trim().length < 4}
          className="prototype-generate inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isGenerating ? 'Generating Architecture...' : 'Generate Blueprint'}</span>
        </button>
      </div>
    </section>
  );
}
