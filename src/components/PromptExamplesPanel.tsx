import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUpRight } from 'lucide-react';
import { PROMPT_EXAMPLES } from '../data/promptExamples';
import type { PromptExample } from '../types/ml';

interface PromptExamplesPanelProps {
  selectedExampleId: string | null;
  onSelectExample: (example: PromptExample) => void;
}

export function PromptExamplesPanel({ selectedExampleId, onSelectExample }: PromptExamplesPanelProps) {
  const [showAllQuick, setShowAllQuick] = useState(false);
  const [showAllDetailed, setShowAllDetailed] = useState(false);

  const quickExamples = PROMPT_EXAMPLES.filter((p) => p.category === 'quick');
  const detailedExamples = PROMPT_EXAMPLES.filter((p) => p.category === 'detailed');

  const visibleQuick = showAllQuick ? quickExamples : quickExamples.slice(0, 3);
  const visibleDetailed = showAllDetailed ? detailedExamples : detailedExamples.slice(0, 3);

  return (
    <aside className="prototype-panel prototype-left-panel bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-6 h-full">
      <div>
        <h2 className="font-display text-base font-semibold text-slate-900">Prompt Examples</h2>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
          Click any prompt to populate the central workspace editor before generating.
        </p>
      </div>

      {/* Category A: Quick / Non-detailed prompts */}
      <section aria-labelledby="quick-prompts-heading">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <h3 id="quick-prompts-heading" className="text-xs font-semibold text-slate-800">
            A. Quick Project Ideas
          </h3>
          <span className="text-[11px] text-slate-400 tabular-nums">{quickExamples.length} prompts</span>
        </div>

        <div className="mt-2.5 flex flex-col divide-y divide-slate-100">
          {visibleQuick.map((ex) => {
            const isSelected = selectedExampleId === ex.id;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => onSelectExample(ex)}
                className={`group text-left py-2.5 px-2 -mx-2 rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 ${
                  isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                    {ex.title}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5 group-hover:text-blue-600" />
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {ex.domain} <span aria-hidden="true">·</span> Quick idea
                </div>
                <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">{ex.prompt}</p>
              </button>
            );
          })}
        </div>

        {quickExamples.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAllQuick((prev) => !prev)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            {showAllQuick ? (
              <>
                <span>Show fewer</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>View more quick prompts ({quickExamples.length - 3})</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </section>

      {/* Category B: Detailed prompts */}
      <section aria-labelledby="detailed-prompts-heading">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <h3 id="detailed-prompts-heading" className="text-xs font-semibold text-slate-800">
            B. Detailed Specifications
          </h3>
          <span className="text-[11px] text-slate-400 tabular-nums">{detailedExamples.length} specs</span>
        </div>

        <div className="mt-2.5 flex flex-col divide-y divide-slate-100">
          {visibleDetailed.map((ex) => {
            const isSelected = selectedExampleId === ex.id;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => onSelectExample(ex)}
                className={`group text-left py-2.5 px-2 -mx-2 rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 ${
                  isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                    {ex.title}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5 group-hover:text-blue-600" />
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {ex.domain} <span aria-hidden="true">·</span> Problem, data &amp; outcomes
                </div>
                <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">{ex.prompt}</p>
              </button>
            );
          })}
        </div>

        {detailedExamples.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAllDetailed((prev) => !prev)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            {showAllDetailed ? (
              <>
                <span>Show fewer</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>View more detailed specs ({detailedExamples.length - 3})</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </section>
    </aside>
  );
}
