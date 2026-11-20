import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  ClarificationAnswer,
  DatasetCategory,
  MlArchitectureBlueprint,
  RequirementAnalysis,
} from './src/types/ml.ts';
import {
  fetchDatasetRawForBundle,
  getDatasetById,
  getDatasetPreview,
  listDatasets,
} from './server/datasets.ts';
import { runRequirementAgent } from './server/agents/requirementAgent.ts';
import { runClarificationAgent } from './server/agents/clarificationAgent.ts';
import { runRagPipeline } from './server/agents/ragPipeline.ts';
import { runBlueprintGenerator } from './server/agents/blueprintGenerator.ts';
import { runCriticAgent } from './server/agents/criticAgent.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
  });
});

app.get('/api/datasets', (req: Request, res: Response) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const category = (typeof req.query.category === 'string' ? req.query.category : 'All') as DatasetCategory;
  const shuffle = req.query.shuffle === 'true';
  const datasets = listDatasets({ q, category, shuffle });
  res.json({ datasets });
});

app.get('/api/datasets/:id/preview', async (req: Request, res: Response) => {
  try {
    const preview = await getDatasetPreview(String(req.params.id));
    res.json({ preview });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dataset preview.';
    const status = message.includes('not found') ? 404 : 502;
    res.status(status).json({ error: message });
  }
});

app.get('/api/datasets/:id/download', async (req: Request, res: Response) => {
  try {
    const result = await fetchDatasetRawForBundle(String(req.params.id));
    if (!result.bundleable || !result.buffer) {
      res.json({
        bundleable: false,
        dataset: result.dataset,
        reason: result.dataset.packagingNote,
      });
      return;
    }
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('X-Dataset-Bundleable', 'true');
    res.setHeader('X-Dataset-Filename', result.fileName);
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.send(result.buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to download dataset.';
    res.status(502).json({ error: message });
  }
});

app.post('/api/blueprint/analyze', async (req: Request, res: Response) => {
  const t0 = Date.now();
  try {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    const datasetId = typeof req.body?.datasetId === 'string' ? req.body.datasetId : undefined;
    if (prompt.length < 4) {
      res.status(400).json({ error: 'Please enter a machine learning project prompt before analyzing.' });
      return;
    }

    const dataset = datasetId ? getDatasetById(datasetId) ?? null : null;
    let datasetPreview = null;
    if (dataset) {
      try {
        datasetPreview = await getDatasetPreview(dataset.id);
      } catch {
        datasetPreview = null;
      }
    }
    console.log(`[BuildMyML] analyze:preview done in ${Date.now() - t0}ms`);

    const baseReq = await runRequirementAgent({ prompt, dataset, datasetPreview });
    console.log(`[BuildMyML] analyze:requirement done in ${Date.now() - t0}ms`);
    const clarificationQuestions = await runClarificationAgent({
      prompt,
      requirements: baseReq,
      dataset,
    });
    console.log(`[BuildMyML] analyze:clarification done in ${Date.now() - t0}ms`);

    const requirements: RequirementAnalysis = {
      ...baseReq,
      clarificationQuestions,
    };

    res.json({ requirements });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Requirement analysis failed.';
    console.error(`[BuildMyML] analyze error after ${Date.now() - t0}ms:`, message);
    res.status(500).json({ error: message });
  }
});

app.post('/api/blueprint/generate', async (req: Request, res: Response) => {
  const wantsStream = req.query.stream === 'true' || req.headers.accept?.includes('text/event-stream');

  const sendEvent = (event: string, payload: unknown) => {
    if (wantsStream) {
      res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
    }
  };

  if (wantsStream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
  }

  try {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    const datasetId = typeof req.body?.datasetId === 'string' ? req.body.datasetId : undefined;
    const clarifications = Array.isArray(req.body?.clarifications)
      ? (req.body.clarifications as ClarificationAnswer[])
      : [];
    const providedRequirements = req.body?.requirements as RequirementAnalysis | undefined;

    if (prompt.length < 4) {
      throw new Error('Prompt must contain at least 4 characters.');
    }

    const dataset = datasetId ? getDatasetById(datasetId) ?? null : null;

    sendEvent('stage', {
      step: 'requirement',
      label: 'Requirement Agent extracting task, modality, and constraints',
    });

    let datasetPreview = null;
    if (dataset) {
      try {
        datasetPreview = await getDatasetPreview(dataset.id);
      } catch {
        datasetPreview = null;
      }
    }

    const requirements = providedRequirements
      ? providedRequirements
      : {
          ...(await runRequirementAgent({ prompt, dataset, datasetPreview })),
          clarificationQuestions: [],
        };

    sendEvent('stage', {
      step: 'rag',
      label: 'RAG Pipeline retrieving ML architecture patterns and dataset guardrails',
    });

    const { references: ragReferences, contextText: ragContext } = runRagPipeline({
      prompt,
      requirements,
      dataset,
      topK: 5,
    });

    sendEvent('stage', {
      step: 'generator',
      label: 'Blueprint Generator synthesizing 20-section system architecture',
    });

    const draftBlueprint = await runBlueprintGenerator({
      prompt,
      requirements,
      clarifications,
      dataset,
      datasetPreview,
      ragContext,
      ragReferences,
    });

    sendEvent('stage', {
      step: 'critic',
      label: 'Critic Agent auditing leakage, validation splits, and diagram integrity',
    });

    const { validatedBlueprint, criticReport } = await runCriticAgent({
      prompt,
      requirements,
      dataset,
      draftBlueprint,
    });

    const blueprint: MlArchitectureBlueprint = {
      ...validatedBlueprint,
      ragReferences,
      criticReport,
      generatedAt: new Date().toISOString(),
    };

    if (wantsStream) {
      sendEvent('complete', { blueprint, requirements });
      res.end();
    } else {
      res.json({ blueprint, requirements });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Blueprint generation failed.';
    if (wantsStream) {
      sendEvent('error', { error: message });
      res.end();
    } else {
      res.status(500).json({ error: message });
    }
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`BuildMyML server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start BuildMyML server:', err);
  process.exit(1);
});
