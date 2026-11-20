import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import type { ArchitectureDiagram, DiagramNode } from '../types/ml';
import { computeDiagramLayout, renderDiagramToSvgString } from '../utils/diagramRenderer';
import { triggerBlobDownload } from '../utils/pdfGenerator';

const LAYER_STYLES: Record<DiagramNode['layer'], { bg: string; border: string; headerText: string; bar: string }> = {
  Ingestion: { bg: '#F8FAFC', border: '#CBD5E1', headerText: '#334155', bar: '#475569' },
  Processing: { bg: '#F0F9FF', border: '#BAE6FD', headerText: '#0369A1', bar: '#0284C7' },
  Modeling: { bg: '#EFF6FF', border: '#BFDBFE', headerText: '#1D4ED8', bar: '#2563EB' },
  Serving: { bg: '#F0FDF4', border: '#BBF7D0', headerText: '#15803D', bar: '#16A34A' },
  Monitoring: { bg: '#FFFBEB', border: '#FDE68A', headerText: '#B45309', bar: '#D97706' },
};

interface SystemArchitectureDiagramProps {
  diagram: ArchitectureDiagram;
}

export function SystemArchitectureDiagram({ diagram }: SystemArchitectureDiagramProps) {
  const layout = useMemo(() => computeDiagramLayout(diagram), [diagram]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    diagram.nodes[0]?.id ?? null
  );

  const selectedNode = diagram.nodes.find((n) => n.id === selectedNodeId) ?? null;

  const handleDownloadSvg = () => {
    const svg = renderDiagramToSvgString(diagram);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    triggerBlobDownload(blob, 'system_architecture.svg');
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{diagram.title}</h4>
          <p className="text-xs text-slate-500">
            Click any component node to inspect its role and downstream connections.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadSvg}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export SVG</span>
        </button>
      </div>

      <div className="p-4 overflow-x-auto bg-white">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="w-full min-w-[780px] h-auto block"
          role="img"
          aria-label={diagram.title}
        >
          <defs>
            <marker
              id="arch-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
            </marker>
          </defs>

          {layout.lanePositions.map(({ layer, x, width }) => {
            const st = LAYER_STYLES[layer];
            return (
              <g key={layer}>
                <rect
                  x={x}
                  y={16}
                  width={width}
                  height={layout.height - 34}
                  rx={10}
                  fill={st.bg}
                  stroke={st.border}
                  strokeWidth={1}
                />
                <text
                  x={x + width / 2}
                  y={40}
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="700"
                  fill={st.headerText}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {layer.toUpperCase()}
                </text>
              </g>
            );
          })}

          {layout.nodes.map(({ node, x, y, width, height }) => {
            const st = LAYER_STYLES[node.layer];
            const isSelected = selectedNodeId === node.id;
            return (
              <g
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className="cursor-pointer"
              >
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  rx={8}
                  fill="#FFFFFF"
                  stroke={isSelected ? '#2563EB' : '#CBD5E1'}
                  strokeWidth={isSelected ? 2 : 1.2}
                />
                <rect x={x} y={y} width={width} height={4} rx={2} fill={st.bar} />
                <foreignObject x={x + 10} y={y + 10} width={width - 20} height={height - 16}>
                  <div className="h-full flex flex-col justify-start overflow-hidden">
                    <div className="text-[12px] font-semibold text-slate-900 leading-tight line-clamp-2">
                      {node.label}
                    </div>
                    <div className="mt-1 text-[10.5px] text-slate-600 leading-snug line-clamp-3">
                      {node.detail}
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {diagram.edges.map((edge, idx) => {
            const fromNode = layout.nodeMap.get(edge.from);
            const toNode = layout.nodeMap.get(edge.to);
            if (!fromNode || !toNode) return null;

            let x1 = fromNode.x + fromNode.width;
            let y1 = fromNode.y + fromNode.height / 2;
            let x2 = toNode.x;
            let y2 = toNode.y + toNode.height / 2;
            let pathD = '';
            let labelX = (x1 + x2) / 2;
            let labelY = (y1 + y2) / 2 - 6;

            if (fromNode.layerIndex === toNode.layerIndex) {
              x1 = fromNode.x + fromNode.width / 2;
              y1 = fromNode.y + fromNode.height;
              x2 = toNode.x + toNode.width / 2;
              y2 = toNode.y;
              pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
              labelX = x1 + 8;
              labelY = (y1 + y2) / 2;
            } else if (fromNode.layerIndex > toNode.layerIndex) {
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

            const shortLabel = edge.label.length > 22 ? `${edge.label.slice(0, 19)}...` : edge.label;

            return (
              <g key={`${edge.from}-${edge.to}-${idx}`} className="pointer-events-none">
                <path d={pathD} fill="none" stroke="#64748B" strokeWidth={1.6} markerEnd="url(#arch-arrow)" />
                <rect
                  x={labelX - shortLabel.length * 3.1 - 6}
                  y={labelY - 10}
                  width={shortLabel.length * 6.2 + 12}
                  height={16}
                  rx={4}
                  fill="#FFFFFF"
                  stroke="#E2E8F0"
                  strokeWidth={0.8}
                />
                <text x={labelX} y={labelY + 1} textAnchor="middle" fontSize="10" fontWeight="500" fill="#334155">
                  {shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selectedNode && (
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-900">{selectedNode.label}</span>
            <span className="text-slate-500">
              {' '}
              ({selectedNode.layer} Layer) — {selectedNode.detail}
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">Node ID: {selectedNode.id}</span>
        </div>
      )}
    </div>
  );
}
