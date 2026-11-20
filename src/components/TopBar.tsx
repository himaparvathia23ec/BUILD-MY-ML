import type { User } from 'firebase/auth';
import { LogIn, LogOut } from 'lucide-react';

interface TopBarProps {
  activeView: 'workspace' | 'blueprint';
  hasBlueprint: boolean;
  onNavigateWorkspace: () => void;
  onNavigateHistory: () => void;
  onNavigateBlueprint: () => void;
  user: User | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function TopBar({
  activeView,
  hasBlueprint,
  onNavigateWorkspace,
  onNavigateHistory,
  onNavigateBlueprint,
  user,
  authLoading,
  onSignIn,
  onSignOut,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={onNavigateWorkspace}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 rounded-sm"
        >
          BuildMyML
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={onNavigateWorkspace}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeView === 'workspace'
                ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-blue-600'
                : 'hover:text-slate-900'
            }`}
          >
            Workspace
          </button>
          <button
            type="button"
            onClick={onNavigateHistory}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer"
          >
            Recent Projects
          </button>
          {hasBlueprint && (
            <button
              type="button"
              onClick={onNavigateBlueprint}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
                activeView === 'blueprint'
                  ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-blue-600'
                  : 'hover:text-slate-900'
              }`}
            >
              Architecture View
            </button>
          )}
        </nav>

        {/* Zone 3: Single primary auth action */}
        <div className="flex items-center gap-3 shrink-0">
          {authLoading ? (
            <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">Checking session...</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs font-medium text-slate-600 truncate max-w-[160px]">
                {user.displayName || user.email}
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
