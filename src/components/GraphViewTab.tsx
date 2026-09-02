/**
 * TruthTrace: Interactive Claim-Evidence Graph Visualization Tab
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  Claim,
  Source,
  EvidencePassage,
  GraphNode,
  GraphLink,
  EvidenceStance,
  EvidenceStrength
} from '../types';
import {
  buildGraphData,
  generateCitations
} from '../utils/research';
import {
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Filter,
  Layers,
  FileText,
  Quote,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { AiAdvisoryBadge } from './AiAdvisoryBadge';

interface GraphViewTabProps {
  claim: Claim;
  sources: Source[];
  evidenceList: EvidencePassage[];
  onUpdateEvidence: (updated: EvidencePassage) => void;
}

export const GraphViewTab: React.FC<GraphViewTabProps> = ({
  claim,
  sources,
  evidenceList,
  onUpdateEvidence,
}) => {
  const [layoutMode, setLayoutMode] = useState<'radial' | 'tree' | 'layered'>('radial');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showSupporting, setShowSupporting] = useState(true);
  const [showContradicting, setShowContradicting] = useState(true);
  const [showQualifying, setShowQualifying] = useState(true);
  const [showSources, setShowSources] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Raw Graph Data
  const rawGraph = useMemo(
    () => buildGraphData(claim, sources, evidenceList),
    [claim, sources, evidenceList]
  );

  // Filtered Graph Data
  const filteredGraph = useMemo(() => {
    const activeNodes = rawGraph.nodes.filter((node) => {
      if (node.type === 'evidence') {
        if (node.stance === 'SUPPORTING' && !showSupporting) return false;
        if (node.stance === 'CONTRADICTING' && !showContradicting) return false;
        if (node.stance === 'QUALIFYING' && !showQualifying) return false;
      }
      if (node.type === 'source' && !showSources) return false;
      return true;
    });

    const activeNodeIds = new Set(activeNodes.map((n) => n.id));
    const activeLinks = rawGraph.links.filter(
      (link) => activeNodeIds.has(link.source) && activeNodeIds.has(link.target)
    );

    return { nodes: activeNodes, links: activeLinks };
  }, [rawGraph, showSupporting, showContradicting, showQualifying, showSources]);

  // Compute Layout Coordinates (Width: 900, Height: 600)
  const positionedNodes = useMemo(() => {
    const width = 900;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodes = [...filteredGraph.nodes];
    const nodeMap = new Map<string, GraphNode>();

    if (layoutMode === 'radial') {
      // Center Claim Node
      const claimNode = nodes.find((n) => n.type === 'claim');
      if (claimNode) {
        claimNode.x = centerX;
        claimNode.y = centerY;
        nodeMap.set(claimNode.id, claimNode);
      }

      // Ring 1: Subclaims (Radius 160)
      const subclaimNodes = nodes.filter((n) => n.type === 'subclaim');
      subclaimNodes.forEach((sc, i) => {
        const angle = (i / (subclaimNodes.length || 1)) * 2 * Math.PI - Math.PI / 2;
        sc.x = centerX + 160 * Math.cos(angle);
        sc.y = centerY + 160 * Math.sin(angle);
        nodeMap.set(sc.id, sc);
      });

      // Ring 2: Evidence Nodes (Radius 270)
      const evidenceNodes = nodes.filter((n) => n.type === 'evidence');
      evidenceNodes.forEach((ev, i) => {
        const angle = (i / (evidenceNodes.length || 1)) * 2 * Math.PI - Math.PI / 4;
        ev.x = centerX + 270 * Math.cos(angle);
        ev.y = centerY + 270 * Math.sin(angle);
        nodeMap.set(ev.id, ev);
      });

      // Ring 3: Source Nodes (Radius 360)
      const sourceNodes = nodes.filter((n) => n.type === 'source');
      sourceNodes.forEach((src, i) => {
        const angle = (i / (sourceNodes.length || 1)) * 2 * Math.PI;
        src.x = centerX + 370 * Math.cos(angle);
        src.y = centerY + 370 * Math.sin(angle);
        nodeMap.set(src.id, src);
      });
    } else if (layoutMode === 'layered') {
      // Column 1: Claim (x=100)
      const claimNode = nodes.find((n) => n.type === 'claim');
      if (claimNode) {
        claimNode.x = 100;
        claimNode.y = centerY;
        nodeMap.set(claimNode.id, claimNode);
      }

      // Column 2: Subclaims (x=320)
      const subclaims = nodes.filter((n) => n.type === 'subclaim');
      subclaims.forEach((sc, i) => {
        sc.x = 320;
        sc.y = 100 + (i + 1) * ((height - 180) / ((subclaims.length || 1) + 1));
        nodeMap.set(sc.id, sc);
      });

      // Column 3: Evidence (x=570)
      const evidence = nodes.filter((n) => n.type === 'evidence');
      evidence.forEach((ev, i) => {
        ev.x = 570;
        ev.y = 80 + (i + 1) * ((height - 120) / ((evidence.length || 1) + 1));
        nodeMap.set(ev.id, ev);
      });

      // Column 4: Sources (x=800)
      const sourcesList = nodes.filter((n) => n.type === 'source');
      sourcesList.forEach((src, i) => {
        src.x = 800;
        src.y = 90 + (i + 1) * ((height - 140) / ((sourcesList.length || 1) + 1));
        nodeMap.set(src.id, src);
      });
    } else {
      // Tree Mode
      const claimNode = nodes.find((n) => n.type === 'claim');
      if (claimNode) {
        claimNode.x = centerX;
        claimNode.y = 70;
        nodeMap.set(claimNode.id, claimNode);
      }

      const subclaims = nodes.filter((n) => n.type === 'subclaim');
      subclaims.forEach((sc, i) => {
        sc.x = 150 + (i + 1) * ((width - 300) / ((subclaims.length || 1) + 1));
        sc.y = 200;
        nodeMap.set(sc.id, sc);
      });

      const evidence = nodes.filter((n) => n.type === 'evidence');
      evidence.forEach((ev, i) => {
        ev.x = 80 + (i + 1) * ((width - 160) / ((evidence.length || 1) + 1));
        ev.y = 360;
        nodeMap.set(ev.id, ev);
      });

      const sourcesList = nodes.filter((n) => n.type === 'source');
      sourcesList.forEach((src, i) => {
        src.x = 100 + (i + 1) * ((width - 200) / ((sourcesList.length || 1) + 1));
        src.y = 510;
        nodeMap.set(src.id, src);
      });
    }

    return nodeMap;
  }, [filteredGraph.nodes, layoutMode]);

  // Selected Node Details
  const selectedNode = selectedNodeId
    ? filteredGraph.nodes.find((n) => n.id === selectedNodeId)
    : null;
  const selectedEvidence =
    selectedNode?.type === 'evidence'
      ? evidenceList.find((e) => e.id === selectedNode.entityId)
      : null;
  const selectedSource =
    selectedNode?.type === 'source'
      ? sources.find((s) => s.id === selectedNode.entityId)
      : null;

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const exportSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TruthTrace-Graph-${claim.id}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Epistemic Claim-Evidence Graph</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredGraph.nodes.length} nodes · {filteredGraph.links.length} edges
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual topology mapping claims to sub-propositions, extracted quotes, and originating sources.
          </p>
        </div>

        {/* Layout Mode Switcher & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layout buttons */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setLayoutMode('radial')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium cursor-pointer ${
                layoutMode === 'radial' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Radial Cluster
            </button>
            <button
              onClick={() => setLayoutMode('layered')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium cursor-pointer ${
                layoutMode === 'layered' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Layered Flow
            </button>
            <button
              onClick={() => setLayoutMode('tree')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium cursor-pointer ${
                layoutMode === 'tree' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hierarchy Tree
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 2))}
              className="p-1 text-slate-700 hover:text-slate-900 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1 text-slate-600">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.5))}
              className="p-1 text-slate-700 hover:text-slate-900 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={exportSvg}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            title="Download vector SVG of graph"
          >
            <Download className="w-3.5 h-3.5" />
            Export SVG
          </button>
        </div>
      </div>

      {/* Filter Checkbox Toggles */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap items-center gap-4 text-xs">
        <span className="font-semibold text-slate-700 flex items-center gap-1">
          <Filter className="w-3 h-3 text-slate-400" />
          Filter Nodes:
        </span>

        <label className="flex items-center gap-1.5 cursor-pointer text-emerald-800 font-medium">
          <input
            type="checkbox"
            checked={showSupporting}
            onChange={(e) => setShowSupporting(e.target.checked)}
            className="rounded text-emerald-600 cursor-pointer"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          Supporting
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer text-rose-800 font-medium">
          <input
            type="checkbox"
            checked={showContradicting}
            onChange={(e) => setShowContradicting(e.target.checked)}
            className="rounded text-rose-600 cursor-pointer"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          Contradicting
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer text-amber-800 font-medium">
          <input
            type="checkbox"
            checked={showQualifying}
            onChange={(e) => setShowQualifying(e.target.checked)}
            className="rounded text-amber-600 cursor-pointer"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          Qualifying
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer text-indigo-800 font-medium">
          <input
            type="checkbox"
            checked={showSources}
            onChange={(e) => setShowSources(e.target.checked)}
            className="rounded text-indigo-600 cursor-pointer"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          Sources
        </label>
      </div>

      {/* Canvas Area & Interactive Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Interactive Canvas */}
        <div
          className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-inner relative select-none h-[540px] cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Legend Overlay */}
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 space-y-1 z-10 font-sans pointer-events-none">
            <div className="font-semibold text-white mb-1">Graph Legend</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-100 border-2 border-slate-400 inline-block" />
              <span>Master Claim</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block" />
              <span>Sub-claims</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span>Supporting Passage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
              <span>Refuting Passage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>Qualifying Passage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 inline-block" />
              <span>Primary Source</span>
            </div>
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 900 600"
            className="w-full h-full"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Defs for gradients & markers */}
            <defs>
              <marker
                id="arrow-support"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
              </marker>
              <marker
                id="arrow-refute"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
              </marker>
              <marker
                id="arrow-qualify"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
              </marker>
              <marker
                id="arrow-neutral"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
              </marker>
            </defs>

            {/* Links / Edges */}
            <g className="links">
              {filteredGraph.links.map((link, idx) => {
                const srcNode = positionedNodes.get(link.source);
                const tgtNode = positionedNodes.get(link.target);
                if (!srcNode || !tgtNode || srcNode.x === undefined || tgtNode.x === undefined)
                  return null;

                let strokeColor = '#475569';
                let marker = 'url(#arrow-neutral)';
                let strokeWidth = 1.5;

                if (link.stance === 'SUPPORTING') {
                  strokeColor = '#10b981';
                  marker = 'url(#arrow-support)';
                  strokeWidth = 2;
                } else if (link.stance === 'CONTRADICTING') {
                  strokeColor = '#f43f5e';
                  marker = 'url(#arrow-refute)';
                  strokeWidth = 2;
                } else if (link.stance === 'QUALIFYING') {
                  strokeColor = '#f59e0b';
                  marker = 'url(#arrow-qualify)';
                  strokeWidth = 1.8;
                }

                return (
                  <line
                    key={`link-${idx}`}
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeOpacity={0.7}
                    markerEnd={marker}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g className="nodes">
              {filteredGraph.nodes.map((node) => {
                const pos = positionedNodes.get(node.id);
                if (!pos || pos.x === undefined || pos.y === undefined) return null;

                const isSelected = node.id === selectedNodeId;

                // Stance/Type visual parameters
                let fill = '#1e293b';
                let stroke = '#64748b';
                let radius = 14;

                if (node.type === 'claim') {
                  fill = '#f8fafc';
                  stroke = '#d97706';
                  radius = 24;
                } else if (node.type === 'subclaim') {
                  fill = '#0284c7';
                  stroke = '#38bdf8';
                  radius = 16;
                } else if (node.type === 'source') {
                  fill = '#4f46e5';
                  stroke = '#818cf8';
                  radius = 15;
                } else if (node.type === 'evidence') {
                  if (node.stance === 'SUPPORTING') {
                    fill = '#059669';
                    stroke = '#34d399';
                  } else if (node.stance === 'CONTRADICTING') {
                    fill = '#e11d48';
                    stroke = '#fb7185';
                  } else if (node.stance === 'QUALIFYING') {
                    fill = '#d97706';
                    stroke = '#fbbf24';
                  } else {
                    fill = '#475569';
                    stroke = '#94a3b8';
                  }
                  radius = 13;
                }

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    {isSelected && (
                      <circle
                        r={radius + 7}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeDasharray="4 3"
                        className="animate-pulse"
                      />
                    )}

                    <circle
                      r={radius}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isSelected ? 3 : 2}
                      className="shadow-lg"
                    />

                    {/* Node Icon/Text inside */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      fontSize={node.type === 'claim' ? 12 : 9}
                      fontWeight="bold"
                      fill={node.type === 'claim' ? '#0f172a' : '#ffffff'}
                      pointerEvents="none"
                      fontFamily="sans-serif"
                    >
                      {node.type === 'claim'
                        ? '★'
                        : node.type === 'subclaim'
                        ? 'SC'
                        : node.type === 'source'
                        ? 'SRC'
                        : node.stance === 'SUPPORTING'
                        ? '+'
                        : node.stance === 'CONTRADICTING'
                        ? '−'
                        : '~'}
                    </text>

                    {/* Label below node */}
                    <text
                      y={radius + 13}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#e2e8f0"
                      className="font-mono pointer-events-none"
                      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                    >
                      {node.label.length > 20 ? `${node.label.substring(0, 18)}...` : node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Node Deep-Dive Inspector Drawer */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col h-[540px] overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                  {selectedNode.type} Node Inspector
                </span>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Detail Content based on node type */}
              {selectedEvidence && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-medium">
                      Extracted Quote
                    </span>
                    <blockquote className="text-sm italic text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1 leading-relaxed">
                      "{selectedEvidence.quote}"
                    </blockquote>
                  </div>

                  {/* Stance Selector */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Assigned Stance:
                    </label>
                    <select
                      value={selectedEvidence.stance}
                      onChange={(e) =>
                        onUpdateEvidence({
                          ...selectedEvidence,
                          stance: e.target.value as EvidenceStance,
                        })
                      }
                      className="w-full text-xs p-2 rounded-md border border-slate-300 font-semibold bg-white cursor-pointer"
                    >
                      <option value="SUPPORTING">Supporting (+)</option>
                      <option value="CONTRADICTING">Contradicting / Refuting (−)</option>
                      <option value="QUALIFYING">Qualifying / Contextual (~)</option>
                      <option value="NEUTRAL">Neutral</option>
                    </select>
                  </div>

                  {/* Strength Level */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Strength Rating:
                    </label>
                    <select
                      value={selectedEvidence.strength}
                      onChange={(e) =>
                        onUpdateEvidence({
                          ...selectedEvidence,
                          strength: e.target.value as EvidenceStrength,
                        })
                      }
                      className="w-full text-xs p-2 rounded-md border border-slate-300 bg-white cursor-pointer"
                    >
                      <option value="HIGH">High Rigor</option>
                      <option value="MODERATE">Moderate Rigor</option>
                      <option value="WEAK">Weak / Anecdotal</option>
                      <option value="FLAWED">Methodologically Flawed</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-medium">
                      Methodological Rationale
                    </span>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                      {selectedEvidence.strengthRationale || 'No rationale recorded.'}
                    </p>
                  </div>

                  {selectedEvidence.aiGenerated && (
                    <AiAdvisoryBadge
                      label="AI Extraction"
                      showDetails
                      confidenceScore={selectedEvidence.aiConfidenceScore}
                    />
                  )}
                </div>
              )}

              {selectedSource && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-medium">
                      Publication Outlet
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedSource.publication}
                    </h3>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-medium">
                      Document Title
                    </span>
                    <p className="text-xs text-slate-800 leading-snug font-medium">
                      {selectedSource.title}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-medium">
                      Trust Tier & Credibility
                    </span>
                    <span className="inline-block text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 mt-1">
                      {selectedSource.credibility.overallTrustTier}
                    </span>
                  </div>

                  {selectedSource.url && (
                    <a
                      href={selectedSource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-700 hover:text-indigo-900 font-medium underline block pt-2"
                    >
                      Open Document URL →
                    </a>
                  )}
                </div>
              )}

              {selectedNode.type === 'claim' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-medium">
                      Master Hypothesis
                    </span>
                    <p className="text-sm italic text-slate-900 leading-relaxed mt-1">
                      "{claim.statement}"
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-medium">
                      Status & Domain
                    </span>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                      {claim.status.replace('_', ' ').toUpperCase()} · {claim.domain}
                    </p>
                  </div>
                </div>
              )}

              {selectedNode.type === 'subclaim' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-medium">
                      Sub-Claim Proposition
                    </span>
                    <p className="text-xs text-slate-900 font-medium leading-relaxed mt-1">
                      {selectedNode.label}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 space-y-2 my-auto">
              <Share2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">Click any node in the graph</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Inspect quote veracity, modify stance relationships, or audit source provenance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
