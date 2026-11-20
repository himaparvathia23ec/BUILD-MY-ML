import { Check, ExternalLink, Eye, Search, Shuffle } from 'lucide-react';
import type { DatasetCategory, DatasetEntry } from '../types/ml';

const CATEGORIES: DatasetCategory[] = [
  'All',
  'Classification',
  'Regression',
  'Healthcare',
  'Finance',
  'Time Series',
  'NLP & Text',
  'Computer Vision',
];

interface DatasetExplorerPanelProps {
  datasets: DatasetEntry[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: DatasetCategory;
  onCategoryChange: (cat: DatasetCategory) => void;
  onShuffle: () => void;
  selectedDatasetId: string | null;
  onSelectDataset: (dataset: DatasetEntry) => void;
  onPreviewDataset: (dataset: DatasetEntry) => void;
}

export function DatasetExplorerPanel({
  datasets,
  loading,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onShuffle,
  selectedDatasetId,
  onSelectDataset,
  onPreviewDataset,
}: DatasetExplorerPanelProps) {
  return (
    <aside className="prototype-panel prototype-right-panel bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">Random Dataset Explorer</h2>
          <p className="mt-1 text-xs text-slate-500">
            Verified datasets from UCI, OpenML, and NOAA/Vega repositories.
          </p>
        </div>
        <button
          type="button"
          onClick={onShuffle}
          title="Shuffle random dataset discovery"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Randomize</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search datasets (e.g. churn, credit, weather)..."
          aria-label="Search curated datasets"
          className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
        />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg" role="tablist" aria-label="Dataset categories">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onCategoryChange(cat)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Dataset List */}
      <div className="flex-1 overflow-y-auto max-h-[540px] pr-1 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-slate-200 rounded-lg p-3.5 animate-pulse space-y-2">
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-8 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : datasets.length === 0 ? (
          <div className="border border-slate-200 rounded-lg p-6 text-center">
            <p className="text-xs font-medium text-slate-700">No datasets matched your filter.</p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onCategoryChange('All');
              }}
              className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Reset dataset filters
            </button>
          </div>
        ) : (
          datasets.map((ds) => {
            const isSelected = selectedDatasetId === ds.id;
            return (
              <article
                key={ds.id}
                className={`prototype-dataset-card border rounded-xl p-3.5 transition-colors ${
                  isSelected ? 'border-blue-600 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">{ds.name}</h3>
                  <a
                    href={ds.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Open verified source (${ds.repository})`}
                    aria-label={`Open verified source for ${ds.name}`}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Unboxed metadata per Zero-Pill discipline */}
                <div className="mt-1 text-[11px] text-slate-500 tabular-nums">
                  <span>{ds.category}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{ds.repository}</span>
                  <span aria-hidden="true"> · </span>
                  <span>
                    {ds.rows.toLocaleString()} rows × {ds.columnCount} cols
                  </span>
                  <span aria-hidden="true"> · </span>
                  <span>{ds.format}</span>
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-2">{ds.description}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onPreviewDataset(ds)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectDataset(ds)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{isSelected ? 'Selected' : 'Select Dataset'}</span>
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </aside>
  );
}
