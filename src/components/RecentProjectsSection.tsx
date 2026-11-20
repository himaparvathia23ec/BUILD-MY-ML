import type { User } from 'firebase/auth';
import { Archive, Eye, FolderOpen, LogIn, Trash2, Loader2 } from 'lucide-react';
import type { SavedProject } from '../types/ml';

interface RecentProjectsSectionProps {
  user: User | null;
  loading: boolean;
  projects: SavedProject[];
  exportingZipId: string | null;
  onSignIn: () => void;
  onViewBlueprint: (project: SavedProject) => void;
  onDownloadZip: (project: SavedProject) => void;
  onReopenProject: (project: SavedProject) => void;
  onDeleteProject: (projectId: string) => void;
}

export function RecentProjectsSection({
  user,
  loading,
  projects,
  exportingZipId,
  onSignIn,
  onViewBlueprint,
  onDownloadZip,
  onReopenProject,
  onDeleteProject,
}: RecentProjectsSectionProps) {
  return (
    <section id="recent-projects" className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">Recent Projects</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Persistent ML architecture history synchronized with your authenticated workspace account.
          </p>
        </div>
        {user && (
          <span className="text-xs text-slate-500 tabular-nums">
            {projects.length} saved {projects.length === 1 ? 'blueprint' : 'blueprints'}
          </span>
        )}
      </div>

      {!user ? (
        <div className="py-10 flex flex-col items-center text-center max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-slate-900">Sign in to persist your project history</h3>
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
            Authenticate with Google to automatically save generated 20-section architectures, reopen previous prompts, and export ZIP packages across sessions.
          </p>
          <button
            type="button"
            onClick={onSignIn}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In with Google</span>
          </button>
        </div>
      ) : loading ? (
        <div className="py-6 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-slate-50 border border-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm font-medium text-slate-800">No saved blueprints yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Generate your first ML architecture above and it will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {projects.map((proj) => {
            const isExportingZip = exportingZipId === proj.id;
            const dateLabel = new Date(proj.createdAtMs).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={proj.id}
                className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{proj.title}</h3>
                    <span className="text-xs text-slate-500 tabular-nums">
                      {proj.mlTaskType} <span aria-hidden="true">·</span> {dateLabel}
                      {proj.datasetName ? (
                        <>
                          {' '}
                          <span aria-hidden="true">·</span> {proj.datasetName}
                        </>
                      ) : null}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">{proj.prompt}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onViewBlueprint(proj)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Blueprint</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDownloadZip(proj)}
                    disabled={isExportingZip}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {isExportingZip ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                    <span>{isExportingZip ? 'Packaging...' : 'Download ZIP'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onReopenProject(proj)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Reopen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteProject(proj.id)}
                    aria-label={`Delete ${proj.title}`}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
