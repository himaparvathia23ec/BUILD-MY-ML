import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type {
  ClarificationAnswer,
  DatasetEntry,
  MlArchitectureBlueprint,
  SavedProject,
} from '../types/ml';

function clampString(value: string, maxLen: number): string {
  const trimmed = value.trim();
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

function generateValidId(prefix: string): string {
  const raw =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${raw.replace(/[^a-zA-Z0-9_\-]/g, '_')}`.slice(0, 128);
}

function toMillis(ts: unknown): number {
  if (ts instanceof Timestamp) {
    return ts.toMillis();
  }
  if (ts && typeof ts === 'object' && 'seconds' in ts && typeof (ts as { seconds: number }).seconds === 'number') {
    return (ts as { seconds: number }).seconds * 1000;
  }
  return Date.now();
}

export async function upsertUserProfile(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  try {
    const existingSnap = await getDoc(userRef);
    const displayName = clampString(user.displayName || user.email?.split('@')[0] || 'ML Architect', 120);
    const email = clampString(user.email || '', 254);

    if (!existingSnap.exists()) {
      const payload: Record<string, unknown> = {
        uid: user.uid,
        displayName,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (user.photoURL) {
        payload.photoURL = clampString(user.photoURL, 1024);
      }
      await setDoc(userRef, payload);
    } else {
      const updatePayload: Record<string, unknown> = {
        displayName,
        updatedAt: serverTimestamp(),
      };
      if (user.photoURL) {
        updatePayload.photoURL = clampString(user.photoURL, 1024);
      }
      await updateDoc(userRef, updatePayload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeUserProjects(
  userId: string,
  onProjects: (projects: SavedProject[]) => void,
  onError: (err: Error) => void
): () => void {
  const path = 'projects';
  const q = query(collection(db, path), where('ownerId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SavedProject[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id ?? d.id),
          ownerId: String(data.ownerId ?? userId),
          title: String(data.title ?? 'Untitled Architecture'),
          prompt: String(data.prompt ?? ''),
          mlTaskType: String(data.mlTaskType ?? 'Machine Learning'),
          datasetId: typeof data.datasetId === 'string' ? data.datasetId : undefined,
          datasetName: typeof data.datasetName === 'string' ? data.datasetName : undefined,
          datasetSourceUrl: typeof data.datasetSourceUrl === 'string' ? data.datasetSourceUrl : undefined,
          clarifications: Array.isArray(data.clarifications) ? (data.clarifications as ClarificationAnswer[]) : [],
          blueprint: data.blueprint as MlArchitectureBlueprint,
          status: data.status === 'archived' ? 'archived' : 'generated',
          createdAtMs: toMillis(data.createdAt),
          updatedAtMs: toMillis(data.updatedAt),
        };
      });
      items.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
      onProjects(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function saveGeneratedProject(params: {
  userId: string;
  prompt: string;
  dataset?: DatasetEntry | null;
  clarifications?: ClarificationAnswer[];
  blueprint: MlArchitectureBlueprint;
  existingProjectId?: string;
}): Promise<SavedProject> {
  const projectId = params.existingProjectId
    ? clampString(params.existingProjectId.replace(/[^a-zA-Z0-9_\-]/g, '_'), 128)
    : generateValidId('proj');

  const path = `projects/${projectId}`;
  const docRef = doc(db, 'projects', projectId);

  const sanitizedClarifications = (params.clarifications ?? []).slice(0, 15).map((c) => ({
    questionId: clampString(c.questionId, 64),
    question: clampString(c.question, 400),
    answer: clampString(c.answer, 500),
  }));

  const payload: Record<string, unknown> = {
    id: projectId,
    ownerId: params.userId,
    title: clampString(params.blueprint.title || 'ML Architecture Blueprint', 200),
    prompt: clampString(params.prompt, 8000),
    mlTaskType: clampString(params.blueprint.mlTaskType || 'Machine Learning', 120),
    blueprint: params.blueprint,
    status: 'generated',
  };

  if (params.dataset) {
    payload.datasetId = clampString(params.dataset.id, 128);
    payload.datasetName = clampString(params.dataset.name, 200);
    payload.datasetSourceUrl = clampString(params.dataset.sourceUrl, 1024);
  }
  if (sanitizedClarifications.length > 0) {
    payload.clarifications = sanitizedClarifications;
  }

  try {
    const existing = params.existingProjectId ? await getDoc(docRef) : null;
    if (existing && existing.exists()) {
      await updateDoc(docRef, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const now = Date.now();
    return {
      id: projectId,
      ownerId: params.userId,
      title: String(payload.title),
      prompt: String(payload.prompt),
      mlTaskType: String(payload.mlTaskType),
      datasetId: params.dataset?.id,
      datasetName: params.dataset?.name,
      datasetSourceUrl: params.dataset?.sourceUrl,
      clarifications: sanitizedClarifications,
      blueprint: params.blueprint,
      status: 'generated',
      createdAtMs: now,
      updatedAtMs: now,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserProject(projectId: string): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
