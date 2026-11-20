import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser, testFirestoreConnection } from './firebase';
import {
  deleteUserProject,
  saveGeneratedProject,
  subscribeUserProjects,
  upsertUserProfile,
} from './services/projectRepository';
import type {
  ClarificationAnswer,
  ClarificationQuestion,
  DatasetCategory,
  DatasetEntry,
  DatasetPreview,
  MlArchitectureBlueprint,
  PromptExample,
  RequirementAnalysis,
  SavedProject,
} from './types/ml';
import { TopBar } from './components/TopBar';
import { PromptExamplesPanel } from './components/PromptExamplesPanel';
import { PromptWorkspacePanel, type GenerationStage } from './components/PromptWorkspacePanel';
import { DatasetExplorerPanel } from './components/DatasetExplorerPanel';
import { DatasetPreviewModal } from './components/DatasetPreviewModal';
import { RecentProjectsSection } from './components/RecentProjectsSection';
import { BlueprintResultsView } from './components/BlueprintResultsView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { generateArchitecturePdfBlob, triggerBlobDownload } from './utils/pdfGenerator';
import { generateProjectZipBlob } from './utils/zipExporter';

function slugifyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 48) || 'buildmyml_project'
  );
}

function BuildMyMLApp() {
  // Auth & persistent history state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Navigation
  const [activeView, setActiveView] = useState<'workspace' | 'blueprint'>('workspace');

  // Workspace state
  const [prompt, setPrompt] = useState('');
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<DatasetEntry | null>(null);
  const [reopenedProjectId, setReopenedProjectId] = useState<string | undefined>(undefined);

  // Dataset Explorer state
  const [allDatasets, setAllDatasets] = useState<DatasetEntry[]>([]);
  const [datasets, setDatasets] = useState<DatasetEntry[]>([]);
  const [datasetsLoading, setDatasetsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DatasetCategory>('All');
  const [shuffleSeed, setShuffleSeed] = useState(1);

  // Dataset preview modal state
  const [previewTarget, setPreviewTarget] = useState<DatasetEntry | null>(null);
  const [previewData, setPreviewData] = useState<DatasetPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Generation & Clarification state
  const [stage, setStage] = useState<GenerationStage>('idle');
  const [stageMessage, setStageMessage] = useState('');
  const [genError, setGenError] = useState<string | null>(null);
  const [pendingRequirements, setPendingRequirements] = useState<RequirementAnalysis | null>(null);
  const [clarificationQuestions, setClarificationQuestions] = useState<ClarificationQuestion[]>([]);

  // Active Blueprint result state
  const [activeBlueprint, setActiveBlueprint] = useState<MlArchitectureBlueprint | null>(null);
  const [activePrompt, setActivePrompt] = useState('');
  const [activeClarifications, setActiveClarifications] = useState<ClarificationAnswer[]>([]);
  const [activeDataset, setActiveDataset] = useState<DatasetEntry | null>(null);

  // Export loading states
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);
  const [exportingHistoryZipId, setExportingHistoryZipId] = useState<string | null>(null);

  // Initialize Firebase connection & auth subscription
  useEffect(() => {
    testFirestoreConnection();
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
      if (nextUser) {
        try {
          await upsertUserProfile(nextUser);
        } catch (err) {
          console.error('Failed to sync user profile:', err);
        }
      } else {
        setProjects([]);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to persistent user projects when authenticated
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setProjectsLoading(false);
      return;
    }
    setProjectsLoading(true);
    const unsub = subscribeUserProjects(
      user.uid,
      (items) => {
        setProjects(items);
        setProjectsLoading(false);
      },
      (err) => {
        console.error('Project history subscription error:', err);
        setProjectsLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  // Load full catalog once for lookups (e.g., reopening saved projects)
  useEffect(() => {
    fetch('/api/datasets')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.datasets)) {
          setAllDatasets(data.datasets);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch filtered / shuffled datasets for Right Panel
  useEffect(() => {
    let cancelled = false;
    setDatasetsLoading(true);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    params.set('shuffle', 'true');

    fetch(`/api/datasets?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setDatasets(Array.isArray(data.datasets) ? data.datasets : []);
          setDatasetsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDatasetsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [searchQuery, selectedCategory, shuffleSeed]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Google sign-in failed.');
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
  };

  const handleSelectExample = (example: PromptExample) => {
    setSelectedExampleId(example.id);
    setPrompt(example.prompt);
    setStage('idle');
    setGenError(null);
    setClarificationQuestions([]);
    setPendingRequirements(null);
  };

  const handleSelectDataset = (dataset: DatasetEntry) => {
    setSelectedDataset((prev) => (prev?.id === dataset.id ? null : dataset));
  };

  const handlePreviewDataset = async (dataset: DatasetEntry) => {
    setPreviewTarget(dataset);
    setPreviewData(null);
    setPreviewError(null);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/datasets/${encodeURIComponent(dataset.id)}/preview`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load dataset preview.');
      }
      setPreviewData(data.preview);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Failed to load dataset preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const runStreamingGeneration = useCallback(
    async (
      targetPrompt: string,
      targetDataset: DatasetEntry | null,
      clarifications: ClarificationAnswer[],
      requirements?: RequirementAnalysis | null
    ) => {
      setStage('requirement');
      setStageMessage('Requirement Agent extracting task, modality, and constraints...');
      setGenError(null);

      try {
        const res = await fetch('/api/blueprint/generate?stream=true', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            prompt: targetPrompt,
            datasetId: targetDataset?.id,
            clarifications,
            requirements: requirements ?? undefined,
          }),
        });

        if (!res.ok || !res.body) {
          const text = await res.text();
          throw new Error(text || `Generation failed with HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let completedBlueprint: MlArchitectureBlueprint | null = null;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const frames = buffer.split('\n\n');
          buffer = frames.pop() ?? '';

          for (const frame of frames) {
            const lines = frame.split('\n');
            let eventName = 'message';
            let dataStr = '';
            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventName = line.slice(6).trim();
              } else if (line.startsWith('data:')) {
                dataStr += line.slice(5).trim();
              }
            }
            if (!dataStr) continue;

            const payload = JSON.parse(dataStr);
            if (eventName === 'stage') {
              const step = payload.step as GenerationStage;
              setStage(step);
              setStageMessage(payload.label || '');
            } else if (eventName === 'error') {
              throw new Error(payload.error || 'Blueprint generation failed.');
            } else if (eventName === 'complete') {
              completedBlueprint = payload.blueprint as MlArchitectureBlueprint;
            }
          }
        }

        if (!completedBlueprint) {
          throw new Error('Server stream ended before returning the completed blueprint.');
        }

        setActiveBlueprint(completedBlueprint);
        setActivePrompt(targetPrompt);
        setActiveClarifications(clarifications);
        setActiveDataset(targetDataset);
        setStage('idle');
        setStageMessage('');
        setClarificationQuestions([]);
        setPendingRequirements(null);
        setActiveView('blueprint');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (user) {
          try {
            const saved = await saveGeneratedProject({
              userId: user.uid,
              prompt: targetPrompt,
              dataset: targetDataset,
              clarifications,
              blueprint: completedBlueprint,
              existingProjectId: reopenedProjectId,
            });
            setReopenedProjectId(saved.id);
          } catch (saveErr) {
            console.error('Failed to persist project to Firestore:', saveErr);
          }
        }
      } catch (err) {
        setStage('idle');
        setStageMessage('');
        setGenError(err instanceof Error ? err.message : 'Blueprint generation failed.');
      }
    },
    [user, reopenedProjectId]
  );

  const handleSubmitPrompt = async () => {
    const trimmed = prompt.trim();
    if (trimmed.length < 4) return;

    setGenError(null);
    setStage('analyzing');
    setStageMessage('Requirement & Clarification Agents analyzing your prompt...');

    try {
      const res = await fetch('/api/blueprint/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          datasetId: selectedDataset?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Requirement analysis failed.');
      }

      const requirements = data.requirements as RequirementAnalysis;
      setPendingRequirements(requirements);

      if (requirements.isUnderspecified && requirements.clarificationQuestions.length > 0) {
        setClarificationQuestions(requirements.clarificationQuestions);
        setStage('clarifying');
        setStageMessage('');
      } else {
        await runStreamingGeneration(trimmed, selectedDataset, [], requirements);
      }
    } catch (err) {
      setStage('idle');
      setStageMessage('');
      setGenError(err instanceof Error ? err.message : 'Failed to analyze prompt.');
    }
  };

  const handleSubmitClarifications = async (answers: ClarificationAnswer[]) => {
    await runStreamingGeneration(prompt.trim(), selectedDataset, answers, pendingRequirements);
  };

  const handleSkipClarifications = async () => {
    await runStreamingGeneration(prompt.trim(), selectedDataset, [], pendingRequirements);
  };

  const handleClearWorkspace = () => {
    setPrompt('');
    setSelectedExampleId(null);
    setSelectedDataset(null);
    setReopenedProjectId(undefined);
    setStage('idle');
    setGenError(null);
    setClarificationQuestions([]);
    setPendingRequirements(null);
  };

  const resolveDatasetForProject = (proj: SavedProject): DatasetEntry | null => {
    if (!proj.datasetId) return null;
    return allDatasets.find((d) => d.id === proj.datasetId) ?? datasets.find((d) => d.id === proj.datasetId) ?? null;
  };

  const handleViewSavedBlueprint = (proj: SavedProject) => {
    setActiveBlueprint(proj.blueprint);
    setActivePrompt(proj.prompt);
    setActiveClarifications(proj.clarifications ?? []);
    setActiveDataset(resolveDatasetForProject(proj));
    setReopenedProjectId(proj.id);
    setActiveView('blueprint');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReopenSavedProject = (proj: SavedProject) => {
    setPrompt(proj.prompt);
    setSelectedDataset(resolveDatasetForProject(proj));
    setReopenedProjectId(proj.id);
    setSelectedExampleId(null);
    setStage('idle');
    setGenError(null);
    setClarificationQuestions([]);
    setPendingRequirements(null);
    setActiveView('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadActivePdf = async () => {
    if (!activeBlueprint) return;
    setExportingPdf(true);
    try {
      const blob = await generateArchitecturePdfBlob({
        prompt: activePrompt,
        clarifications: activeClarifications,
        dataset: activeDataset,
        blueprint: activeBlueprint,
      });
      triggerBlobDownload(blob, `${slugifyTitle(activeBlueprint.title)}_Architecture.pdf`);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'PDF generation failed.');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleDownloadActiveZip = async () => {
    if (!activeBlueprint) return;
    setExportingZip(true);
    try {
      const blob = await generateProjectZipBlob({
        prompt: activePrompt,
        clarifications: activeClarifications,
        dataset: activeDataset,
        blueprint: activeBlueprint,
      });
      triggerBlobDownload(blob, `${slugifyTitle(activeBlueprint.title)}_BuildMyML_Project.zip`);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'ZIP export failed.');
    } finally {
      setExportingZip(false);
    }
  };

  const handleDownloadSavedZip = async (proj: SavedProject) => {
    setExportingHistoryZipId(proj.id);
    try {
      const blob = await generateProjectZipBlob({
        prompt: proj.prompt,
        clarifications: proj.clarifications ?? [],
        dataset: resolveDatasetForProject(proj),
        blueprint: proj.blueprint,
      });
      triggerBlobDownload(blob, `${slugifyTitle(proj.title)}_BuildMyML_Project.zip`);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'ZIP export failed.');
    } finally {
      setExportingHistoryZipId(null);
    }
  };

  const handleDeleteSavedProject = async (projectId: string) => {
    try {
      await deleteUserProject(projectId);
      if (reopenedProjectId === projectId) {
        setReopenedProjectId(undefined);
      }
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to delete project.');
    }
  };

  const handleNavigateHistory = () => {
    setActiveView('workspace');
    setTimeout(() => {
      document.getElementById('recent-projects')?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar
        activeView={activeView}
        hasBlueprint={Boolean(activeBlueprint)}
        onNavigateWorkspace={() => setActiveView('workspace')}
        onNavigateHistory={handleNavigateHistory}
        onNavigateBlueprint={() => {
          if (activeBlueprint) setActiveView('blueprint');
        }}
        user={user}
        authLoading={authLoading}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {activeView === 'blueprint' && activeBlueprint ? (
        <BlueprintResultsView
          prompt={activePrompt}
          clarifications={activeClarifications}
          dataset={activeDataset}
          blueprint={activeBlueprint}
          exportingPdf={exportingPdf}
          exportingZip={exportingZip}
          onDownloadPdf={handleDownloadActivePdf}
          onDownloadZip={handleDownloadActiveZip}
          onReopenInWorkspace={() => {
            setPrompt(activePrompt);
            setSelectedDataset(activeDataset);
            setActiveView('workspace');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBackToWorkspace={() => setActiveView('workspace')}
        />
      ) : (
        <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
          {/* Three-Panel Main Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Panel: Prompt Examples */}
            <div className="lg:col-span-3">
              <PromptExamplesPanel
                selectedExampleId={selectedExampleId}
                onSelectExample={handleSelectExample}
              />
            </div>

            {/* Center Panel: Prompt Workspace */}
            <div className="lg:col-span-5">
              <PromptWorkspacePanel
                prompt={prompt}
                onPromptChange={(val) => {
                  setPrompt(val);
                  if (stage === 'clarifying') {
                    setStage('idle');
                    setClarificationQuestions([]);
                  }
                }}
                onClear={handleClearWorkspace}
                selectedDataset={selectedDataset}
                onClearDataset={() => setSelectedDataset(null)}
                onPreviewDataset={handlePreviewDataset}
                stage={stage}
                stageMessage={stageMessage}
                error={genError}
                pendingRequirements={pendingRequirements}
                clarificationQuestions={clarificationQuestions}
                onSubmitPrompt={handleSubmitPrompt}
                onSubmitClarifications={handleSubmitClarifications}
                onSkipClarifications={handleSkipClarifications}
              />
            </div>

            {/* Right Panel: Random Dataset Explorer */}
            <div className="lg:col-span-4">
              <DatasetExplorerPanel
                datasets={datasets}
                loading={datasetsLoading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onShuffle={() => setShuffleSeed((s) => s + 1)}
                selectedDatasetId={selectedDataset?.id ?? null}
                onSelectDataset={handleSelectDataset}
                onPreviewDataset={handlePreviewDataset}
              />
            </div>
          </div>

          {/* Persistent Recent Projects History */}
          <RecentProjectsSection
            user={user}
            loading={projectsLoading}
            projects={projects}
            exportingZipId={exportingHistoryZipId}
            onSignIn={handleSignIn}
            onViewBlueprint={handleViewSavedBlueprint}
            onDownloadZip={handleDownloadSavedZip}
            onReopenProject={handleReopenSavedProject}
            onDeleteProject={handleDeleteSavedProject}
          />
        </main>
      )}

      {previewTarget && (
        <DatasetPreviewModal
          dataset={previewTarget}
          preview={previewData}
          loading={previewLoading}
          error={previewError}
          isSelected={selectedDataset?.id === previewTarget.id}
          onSelect={(ds) => setSelectedDataset(ds)}
          onClose={() => setPreviewTarget(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BuildMyMLApp />
    </ErrorBoundary>
  );
}
