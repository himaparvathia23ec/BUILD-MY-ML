import { ExternalLink, X, Check } from 'lucide-react';
import type { DatasetEntry, DatasetPreview } from '../types/ml';

interface DatasetPreviewModalProps {
  dataset: DatasetEntry;
  preview: DatasetPreview | null;
  loading: boolean;
  error: string | null;
  isSelected: boolean;
  onSelect: (dataset: DatasetEntry) => void;
  onClose: () => void;
}

export function DatasetPreviewModal({
  dataset,
  preview,
  loading,
  error,
  isSelected,
  onSelect,
  onClose,
}: DatasetPreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dataset-preview-title"
    >
      <div className="prototype-modal bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[86vh] flex flex-col shadow-lg">
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <h2 id="dataset-preview-title" className="font-display text-lg font-semibold text-slate-900">
              {dataset.name}
            </h2>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {dataset.repository} <span aria-hidden="true">·</span> {dataset.rows.toLocaleString()} rows{' '}
              <span aria-hidden="true">×</span> {dataset.columnCount} columns <span aria-hidden="true">·</span>{' '}
              {dataset.format} <span aria-hidden="true">·</span> Target: {dataset.targetColumn}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dataset preview"
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <span>{dataset.packagingNote}</span>
            <a
              href={dataset.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap shrink-0"
            >
              <span>Verified Repository Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Streaming live sample rows from {dataset.repository}...
            </div>
          ) : error ? (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-sm text-red-700">
              {error}
            </div>
          ) : preview && preview.rows.length > 0 ? (
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="min-w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-mono font-medium text-slate-500 border-r border-slate-200">#</th>
                    {preview.columns.map((col, idx) => (
                      <th
                        key={`${col}-${idx}`}
                        className={`py-2.5 px-3 font-mono font-semibold whitespace-nowrap ${
                          col === dataset.targetColumn ? 'text-blue-700 bg-blue-50/50' : 'text-slate-700'
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono text-slate-400 border-r border-slate-100 tabular-nums">
                        {rIdx + 1}
                      </td>
                      {preview.columns.map((_, cIdx) => (
                        <td
                          key={cIdx}
                          className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap max-w-[200px] truncate tabular-nums"
                        >
                          {row[cIdx] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Verified Schema Summary</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                This repository hosts a compressed or large-scale archive ({dataset.format}). Live tabular row streaming
                is skipped for archive formats; canonical schema columns are listed below:
              </p>
              <div className="mt-3 font-mono text-xs text-slate-800 bg-white border border-slate-200 rounded-md p-3">
                {dataset.columns.join(', ')}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-4 bg-slate-50/60">
          <span className="text-xs text-slate-500">License: {dataset.license}</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onSelect(dataset);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSelected ? 'Dataset Selected' : 'Select Dataset'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
