'use client';

import { NetworkMap, NetworkNode, NetworkConnection } from '@/services/networkService';
import { useEffect, useMemo, useRef } from 'react';

interface Props {
  data: NetworkMap;
}

export default function NetworkGraph({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodes = useMemo<NetworkNode[]>(() => data.nodes ?? [], [data.nodes]);
  const edges = useMemo<NetworkConnection[]>(() => data.connections ?? [], [data.connections]);

  const recentIds = useMemo<Set<string>>(() => new Set(nodes.slice(-5).map((n: NetworkNode) => n.id)), [nodes]);

  useEffect(() => {
    // Minimal placeholder layout - can be replaced with a proper graph lib
  }, [nodes, edges]);

  return (
    <div ref={containerRef} className="relative w-full min-h-[320px] p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {nodes.map((n: NetworkNode) => (
          <div key={n.id} className={`rounded border border-gray-800 p-3 bg-gray-900/50 ${recentIds.has(n.id) ? 'cyber-pulse' : ''}`}>
            <div className="text-sm text-cyan-300">{n.name || 'Node'}</div>
            <div className="text-xs text-gray-400">{n.ip || 'unknown'}</div>
            <div className="text-xs mt-1"><span className="px-2 py-0.5 rounded bg-gray-800">{n.type}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}