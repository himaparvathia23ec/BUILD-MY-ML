import type { ArchitectureDiagram, DiagramNode } from '../types/ml';

const LAYERS: DiagramNode['layer'][] = ['Ingestion', 'Processing', 'Modeling', 'Serving', 'Monitoring'];

const LAYER_STYLES: Record<DiagramNode['layer'], { bg: string; border: string; headerText: string; badge: string }> = {
  Ingestion: { bg: '#F8FAFC', border: '#CBD5E1', headerText: '#334155', badge: '#E2E8F0' },
  Processing: { bg: '#F0F9FF', border: '#BAE6FD', headerText: '#0369A1', badge: '#E0F2FE' },
  Modeling: { bg: '#EFF6FF', border: '#BFDBFE', headerText: '#1D4ED8', badge: '#DBEAFE' },
  Serving: { bg: '#F0FDF4', border: '#BBF7D0', headerText: '#15803D', badge: '#DCFCE7' },
  Monitoring: { bg: '#FFFBEB', border: '#FDE68A', headerText: '#B45309', badge: '#FEF3C7' },
};

export interface ComputedNodeLayout {
  node: DiagramNode;
  x: number;
  y: number;
  width: number;
  height: number;
  layerIndex: number;
}

export interface ComputedDiagramLayout {
  width: number;
  height: number;
  laneWidth: number;
  lanePositions: Array<{ layer: DiagramNode['layer']; x: number; width: number }>;
  nodes: ComputedNodeLayout[];
  nodeMap: Map<string, ComputedNodeLayout>;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapTextLines(text: string, maxChars: number, maxLines = 3): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, Math.max(0, maxChars - 3)) + '...';
  }
  return lines;
}

export function computeDiagramLayout(diagram: ArchitectureDiagram): ComputedDiagramLayout {
  const width = 1200;
  const paddingX = 24;
  const laneGap = 16;
  const laneWidth = (width - paddingX * 2 - laneGap * (LAYERS.length - 1)) / LAYERS.length;
  const nodeWidth = laneWidth - 24;
  const nodeHeight = 104;
  const nodeGapY = 26;
  const topOffset = 84;

  const grouped = new Map<DiagramNode['layer'], DiagramNode[]>();
  for (const l of LAYERS) grouped.set(l, []);
  for (const n of diagram.nodes) {
    const list = grouped.get(n.layer) ?? grouped.get('Processing')!;
    list.push(n);
  }

  let maxNodesInLane = 1;
  for (const list of grouped.values()) {
    if (list.length > maxNodesInLane) maxNodesInLane = list.length;
  }

  const height = Math.max(440, topOffset + maxNodesInLane * (nodeHeight + nodeGapY) + 48);

  const lanePositions = LAYERS.map((layer, idx) => ({
    layer,
    x: paddingX + idx * (laneWidth + laneGap),
    width: laneWidth,
  }));

  const nodes: ComputedNodeLayout[] = [];
  const nodeMap = new Map<string, ComputedNodeLayout>();

  LAYERS.forEach((layer, layerIndex) => {
    const laneX = lanePositions[layerIndex].x;
    const laneNodes = grouped.get(layer) ?? [];
    const totalNodesHeight = laneNodes.length * nodeHeight + Math.max(0, laneNodes.length - 1) * nodeGapY;
    const availableHeight = height - topOffset - 32;
    const startY = topOffset + Math.max(12, (availableHeight - totalNodesHeight) / 2);

    laneNodes.forEach((node, idx) => {
      const computed: ComputedNodeLayout = {
        node,
        x: laneX + 12,
        y: startY + idx * (nodeHeight + nodeGapY),
        width: nodeWidth,
        height: nodeHeight,
        layerIndex,
      };
      nodes.push(computed);
      nodeMap.set(node.id, computed);
    });
  });

  return { width, height, laneWidth, lanePositions, nodes, nodeMap };
}

export function renderDiagramToSvgString(diagram: ArchitectureDiagram): string {
  const layout = computeDiagramLayout(diagram);

  const laneRects = layout.lanePositions
    .map(({ layer, x, width }) => {
      const style = LAYER_STYLES[layer];
      return `
        <rect x="${x}" y="44" width="${width}" height="${layout.height - 62}" rx="10" fill="${style.bg}" stroke="${style.border}" stroke-width="1" />
        <text x="${x + width / 2}" y="68" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="12" font-weight="700" fill="${style.headerText}">${escapeXml(layer.toUpperCase())}</text>
      `;
    })
    .join('\n');

  const edgesMarkup = diagram.edges
    .map((edge, idx) => {
      const fromNode = layout.nodeMap.get(edge.from);
      const toNode = layout.nodeMap.get(edge.to);
      if (!fromNode || !toNode) return '';

      let x1 = fromNode.x + fromNode.width;
      let y1 = fromNode.y + fromNode.height / 2;
      let x2 = toNode.x;
      let y2 = toNode.y + toNode.height / 2;

      let pathD = '';
      let labelX = (x1 + x2) / 2;
      let labelY = (y1 + y2) / 2 - 6;

      if (fromNode.layerIndex === toNode.layerIndex) {
        // Same lane vertical connection
        x1 = fromNode.x + fromNode.width / 2;
        y1 = fromNode.y + fromNode.height;
        x2 = toNode.x + toNode.width / 2;
        y2 = toNode.y;
        pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
        labelX = x1 + 8;
        labelY = (y1 + y2) / 2;
      } else if (fromNode.layerIndex > toNode.layerIndex) {
        // Feedback loop routing cleanly along bottom corridor
        x1 = fromNode.x + fromNode.width / 2;
        y1 = fromNode.y + fromNode.height;
        x2 = toNode.x + toNode.width / 2;
        y2 = toNode.y + toNode.height;
        const loopY = Math.max(y1, y2) + 22 + (idx % 2) * 12;
        pathD = `M ${x1} ${y1} L ${x1} ${loopY} L ${x2} ${loopY} L ${x2} ${y2}`;
        labelX = (x1 + x2) / 2;
        labelY = loopY - 5;
      } else {
        const dx = Math.max(30, (x2 - x1) * 0.45);
        pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
      }

      const shortLabel = edge.label.length > 22 ? edge.label.slice(0, 19) + '...' : edge.label;

      return `
        <path d="${pathD}" fill="none" stroke="#64748B" stroke-width="1.6" marker-end="url(#arrow)" />
        <rect x="${labelX - shortLabel.length * 3.1 - 6}" y="${labelY - 10}" width="${shortLabel.length * 6.2 + 12}" height="16" rx="4" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="0.8" />
        <text x="${labelX}" y="${labelY + 1}" text-anchor="middle" font-family="DM Sans, system-ui, sans-serif" font-size="10" font-weight="500" fill="#334155">${escapeXml(shortLabel)}</text>
      `;
    })
    .join('\n');

  const nodesMarkup = layout.nodes
    .map(({ node, x, y, width, height }) => {
      const style = LAYER_STYLES[node.layer];
      const titleLines = wrapTextLines(node.label, 21, 2);
      const detailLines = wrapTextLines(node.detail, 26, 2);
      return `
        <g>
          <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2" />
          <rect x="${x}" y="${y}" width="${width}" height="4" rx="2" fill="${style.headerText}" />
          ${titleLines
            .map(
              (line, i) =>
                `<text x="${x + 12}" y="${y + 24 + i * 16}" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="12.5" font-weight="700" fill="#0F172A">${escapeXml(line)}</text>`
            )
            .join('')}
          ${detailLines
            .map(
              (line, i) =>
                `<text x="${x + 12}" y="${y + 28 + titleLines.length * 16 + i * 14}" font-family="DM Sans, system-ui, sans-serif" font-size="10.5" fill="#475569">${escapeXml(line)}</text>`
            )
            .join('')}
        </g>
      `;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
    </marker>
  </defs>
  <rect width="${layout.width}" height="${layout.height}" fill="#FFFFFF" />
  <text x="24" y="26" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="15" font-weight="700" fill="#0F172A">${escapeXml(diagram.title)}</text>
  ${laneRects}
  ${nodesMarkup}
  ${edgesMarkup}
</svg>`;
}

export async function renderDiagramToPngDataUrl(diagram: ArchitectureDiagram): Promise<{
  dataUrl: string;
  width: number;
  height: number;
}> {
  const layout = computeDiagramLayout(diagram);
  const svgString = renderDiagramToSvgString(diagram);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to rasterize SVG architecture diagram.'));
      image.src = url;
    });

    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = layout.width * scale;
    canvas.height = layout.height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context unavailable.');
    }
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, layout.width, layout.height);

    return {
      dataUrl: canvas.toDataURL('image/png'),
      width: layout.width,
      height: layout.height,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
