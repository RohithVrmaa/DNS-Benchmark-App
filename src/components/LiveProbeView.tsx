import React, { useState } from 'react';
import {
  Search,
  Zap,
  Globe,
  Radio,
  Clock,
  Layers,
  CheckCircle,
  AlertCircle,
  Code2,
  Copy,
  Check,
} from 'lucide-react';
import { DNSResolver, DNSRecordType, LiveProbeResult } from '../types/dns';
import { probeSingleDns } from '../services/dnsBenchmarkEngine';

interface LiveProbeViewProps {
  resolvers: DNSResolver[];
  initialSelectedResolver?: DNSResolver;
}

export const LiveProbeView: React.FC<LiveProbeViewProps> = ({
  resolvers,
  initialSelectedResolver,
}) => {
  const [targetDomain, setTargetDomain] = useState('google.com');
  const [recordType, setRecordType] = useState<DNSRecordType>('A');
  const [selectedResolvers, setSelectedResolvers] = useState<string[]>(
    initialSelectedResolver ? [initialSelectedResolver.id] : ['cloudflare', 'google', 'quad9']
  );
  const [isProbing, setIsProbing] = useState(false);
  const [probeResults, setProbeResults] = useState<LiveProbeResult[]>([]);
  const [viewingJson, setViewingJson] = useState<string | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const presets = [
    { name: 'Google', domain: 'google.com' },
    { name: 'Cloudflare', domain: 'cloudflare.com' },
    { name: 'Discord', domain: 'discord.com' },
    { name: 'Steam CDN', domain: 'steampowered.com' },
    { name: 'Riot Games', domain: 'riotgames.com' },
    { name: 'Microsoft 365', domain: 'office.com' },
    { name: 'GitHub', domain: 'github.com' },
  ];

  const handleToggleResolver = (id: string) => {
    if (selectedResolvers.includes(id)) {
      if (selectedResolvers.length > 1) {
        setSelectedResolvers(selectedResolvers.filter((r) => r !== id));
      }
    } else {
      setSelectedResolvers([...selectedResolvers, id]);
    }
  };

  const handleSelectAllResolvers = () => {
    if (selectedResolvers.length === resolvers.length) {
      setSelectedResolvers(['cloudflare', 'google']);
    } else {
      setSelectedResolvers(resolvers.map((r) => r.id));
    }
  };

  const handleRunProbe = async () => {
    if (!targetDomain.trim()) return;
    setIsProbing(true);
    setProbeResults([]);

    const targets = resolvers.filter((r) => selectedResolvers.includes(r.id));
    const results: LiveProbeResult[] = [];

    for (const resolver of targets) {
      try {
        const res = await probeSingleDns(resolver, targetDomain.trim(), recordType);
        results.push(res);
        setProbeResults([...results]);
      } catch (err: any) {
        results.push({
          resolver,
          domain: targetDomain.trim(),
          recordType,
          latencyMs: 999,
          status: 'error',
          records: [],
          error: err?.message || 'Resolution failed',
        });
        setProbeResults([...results]);
      }
    }

    setIsProbing(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(text);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Controls Container */}
      <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
            Live DNS Query Probe
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Query individual hostnames across multiple resolvers simultaneously and inspect answer records & TTL.
          </p>
        </div>

        {/* Input & Record Type Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Domain Input */}
          <div className="relative flex-1">
            <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={targetDomain}
              onChange={(e) => setTargetDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunProbe()}
              placeholder="e.g. reddit.com, discord.com..."
              className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Record Type Selector */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-mono font-medium shrink-0">
            {(['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS'] as DNSRecordType[]).map((type) => (
              <button
                key={type}
                onClick={() => setRecordType(type)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  recordType === type
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-bold'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Probe Action */}
          <button
            onClick={handleRunProbe}
            disabled={isProbing || !targetDomain.trim()}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 rounded-lg shadow-sm transition-all shrink-0"
          >
            <Zap className={`w-3.5 h-3.5 ${isProbing ? 'animate-bounce' : 'fill-current'}`} />
            <span>{isProbing ? 'Probing...' : 'Probe Query'}</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-neutral-400 text-[11px]">Domain Presets:</span>
          {presets.map((p) => (
            <button
              key={p.domain}
              onClick={() => {
                setTargetDomain(p.domain);
              }}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors border ${
                targetDomain === p.domain
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Resolver Checkbox Selector */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Target Resolvers ({selectedResolvers.length} selected):
            </span>
            <button
              onClick={handleSelectAllResolvers}
              className="text-blue-600 dark:text-blue-400 hover:underline text-[11px]"
            >
              {selectedResolvers.length === resolvers.length ? 'Reset Selection' : 'Select All'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {resolvers.map((r) => {
              const isSelected = selectedResolvers.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => handleToggleResolver(r.id)}
                  className={`flex items-center gap-1.5 p-2 rounded-lg text-left text-xs transition-all border ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 text-neutral-900 dark:text-white font-medium shadow-2xs'
                      : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/80 text-neutral-500 opacity-70'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: r.color }}
                  />
                  <span className="truncate">{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="flex flex-col gap-3">
        {probeResults.length === 0 ? (
          <div className="p-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center flex flex-col items-center justify-center">
            <Radio className="w-9 h-9 text-neutral-400 mb-2 stroke-[1.5]" />
            <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Ready to Probe
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1">
              Select your record type and target resolvers, then click "Probe Query" to inspect real DNS records in real-time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {probeResults.map((item) => {
              const isFastest =
                item.latencyMs === Math.min(...probeResults.map((r) => r.latencyMs));

              return (
                <div
                  key={item.resolver.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.resolver.color }}
                        />
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          {item.resolver.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono tabular-nums text-xs">
                        <span
                          className={`font-bold ${
                            item.latencyMs < 25
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : item.latencyMs < 45
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600'
                          }`}
                        >
                          {item.latencyMs} ms
                        </span>
                        {isFastest && (
                          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 px-1 rounded font-semibold">
                            Fastest
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Query Info */}
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2 font-mono">
                      <span>Query: {item.domain} ({item.recordType})</span>
                      <span>IP: {item.resolver.primaryIPv4}</span>
                    </div>

                    {/* Answer Records */}
                    <div className="mt-2.5 flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                        Answer Records ({item.records.length})
                      </span>
                      {item.records.length === 0 ? (
                        <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-500 font-mono">
                          No answer records returned or query error
                        </div>
                      ) : (
                        item.records.map((rec, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-1.5 rounded bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-100 dark:border-neutral-800 text-xs font-mono"
                          >
                            <span className="truncate text-neutral-800 dark:text-neutral-200">
                              {rec.data}
                            </span>
                            <div className="flex items-center gap-2 shrink-0 text-neutral-400 text-[10px]">
                              <span>TTL {rec.TTL}s</span>
                              <button
                                onClick={() => handleCopy(rec.data)}
                                className="hover:text-blue-600"
                                title="Copy record data"
                              >
                                {copiedIp === rec.data ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Raw JSON toggle button */}
                  <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400">
                      DNSSEC: {item.resolver.features.dnssec ? 'Supported' : 'Standard'}
                    </span>
                    <button
                      onClick={() =>
                        setViewingJson(
                          viewingJson === item.resolver.id ? null : item.resolver.id
                        )
                      }
                      className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Code2 className="w-3 h-3" />
                      <span>{viewingJson === item.resolver.id ? 'Hide JSON' : 'Raw JSON'}</span>
                    </button>
                  </div>

                  {/* Expanded JSON Inspector */}
                  {viewingJson === item.resolver.id && (
                    <pre className="mt-2 p-2 rounded bg-neutral-950 text-neutral-300 font-mono text-[10px] max-h-40 overflow-auto border border-neutral-800">
                      {JSON.stringify(item.rawJson || item.records, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
