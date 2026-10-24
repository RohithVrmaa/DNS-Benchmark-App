import React, { useState } from 'react';
import {
  X,
  Scale,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Zap,
  ArrowRightLeft,
  Laptop,
  Check,
  Copy,
  Activity,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';
import { ResolverBenchmarkResult, DNSResolver } from '../types/dns';

interface ComparisonModalProps {
  initialResolverAId?: string;
  initialResolverBId?: string;
  results: ResolverBenchmarkResult[];
  onClose: () => void;
  onOpenAdapterModal: (resolver: DNSResolver) => void;
  onSelectResolverForProbe: (resolver: DNSResolver) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  initialResolverAId,
  initialResolverBId,
  results,
  onClose,
  onOpenAdapterModal,
  onSelectResolverForProbe,
}) => {
  const completedResults = results.filter((r) => r.status === 'completed' && r.avgLatencyMs > 0);

  // Default to 1st and 2nd fastest if not provided
  const [resolverAId, setResolverAId] = useState<string>(() => {
    if (initialResolverAId && completedResults.some((r) => r.resolverId === initialResolverAId)) {
      return initialResolverAId;
    }
    return completedResults[0]?.resolverId || results[0]?.resolverId || '';
  });

  const [resolverBId, setResolverBId] = useState<string>(() => {
    if (initialResolverBId && completedResults.some((r) => r.resolverId === initialResolverBId)) {
      return initialResolverBId;
    }
    return completedResults[1]?.resolverId || completedResults[0]?.resolverId || results[1]?.resolverId || '';
  });

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const resA = completedResults.find((r) => r.resolverId === resolverAId) || results.find((r) => r.resolverId === resolverAId);
  const resB = completedResults.find((r) => r.resolverId === resolverBId) || results.find((r) => r.resolverId === resolverBId);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSwap = () => {
    const temp = resolverAId;
    setResolverAId(resolverBId);
    setResolverBId(temp);
  };

  if (!resA || !resB) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Please run a benchmark with at least two resolvers to compare.
          </p>
          <button onClick={onClose} className="mt-4 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  // Calculate speed delta
  const latencyDiff = resA.avgLatencyMs - resB.avgLatencyMs;
  const isAFaster = latencyDiff < 0;
  const isBFaster = latencyDiff > 0;
  const isTie = latencyDiff === 0;

  const fasterResolver = isAFaster ? resA : resB;
  const slowerResolver = isAFaster ? resB : resA;
  const speedupPercent = slowerResolver.avgLatencyMs > 0
    ? Math.round((Math.abs(latencyDiff) / slowerResolver.avgLatencyMs) * 100)
    : 0;

  // Jitter delta
  const jitterDiff = resA.jitterMs - resB.jitterMs;
  const isAJitterBetter = jitterDiff < 0;
  const isBJitterBetter = jitterDiff > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>DNS Head-to-Head Comparison Mode</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-500/20">
                  Side-by-Side Breakdown
                </span>
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Detailed metrics comparison between two selected resolvers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSwap}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
              title="Swap Left and Right resolvers"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Swap</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-5 flex flex-col gap-5 overflow-y-auto text-xs">
          {/* Top Resolver Selector Selectboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resolver A Select Box */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px]">
                  Resolver A (Left)
                </span>
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: resA.resolver.color }}
                />
              </div>

              <select
                value={resolverAId}
                onChange={(e) => setResolverAId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {results.map((r) => (
                  <option key={r.resolverId} value={r.resolverId}>
                    {r.resolver.name} ({r.resolver.primaryIPv4}) - {r.avgLatencyMs > 0 ? `${r.avgLatencyMs}ms` : 'Not tested'}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1">
                <span>IP: {resA.resolver.primaryIPv4}</span>
                <span className="truncate">{resA.resolver.provider}</span>
              </div>
            </div>

            {/* Resolver B Select Box */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px]">
                  Resolver B (Right)
                </span>
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: resB.resolver.color }}
                />
              </div>

              <select
                value={resolverBId}
                onChange={(e) => setResolverBId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {results.map((r) => (
                  <option key={r.resolverId} value={r.resolverId}>
                    {r.resolver.name} ({r.resolver.primaryIPv4}) - {r.avgLatencyMs > 0 ? `${r.avgLatencyMs}ms` : 'Not tested'}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1">
                <span>IP: {resB.resolver.primaryIPv4}</span>
                <span className="truncate">{resB.resolver.provider}</span>
              </div>
            </div>
          </div>

          {/* Winner Verdict Banner */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-neutral-900 dark:text-white text-sm">
                  {isTie ? (
                    'Resolvers are tied in average latency!'
                  ) : (
                    <span>
                      <strong>{fasterResolver.resolver.name}</strong> is <strong>{Math.abs(latencyDiff)}ms faster</strong> ({speedupPercent}% speed advantage)
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                  {isTie
                    ? 'Both resolvers exhibit identical average response times.'
                    : `${fasterResolver.resolver.name} responded in ${fasterResolver.avgLatencyMs}ms vs ${slowerResolver.avgLatencyMs}ms on tested targets.`}
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAdapterModal(fasterResolver.resolver)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors shrink-0"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Apply {fasterResolver.resolver.name}</span>
            </button>
          </div>

          {/* Head-to-Head Latency Bar Comparison */}
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col gap-3">
            <span className="font-bold text-neutral-900 dark:text-white text-xs">
              Visual Latency Comparison
            </span>

            {/* Average Latency Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                <span>Average Response Time (RTT)</span>
                <span>{resA.avgLatencyMs}ms vs {resB.avgLatencyMs}ms</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-6 rounded-md bg-neutral-100 dark:bg-neutral-800 p-0.5 overflow-hidden flex items-center">
                  <div
                    className={`h-full rounded flex items-center justify-end px-2 text-[10px] font-mono font-bold text-white transition-all ${
                      isAFaster ? 'bg-emerald-500' : 'bg-neutral-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(15, (resA.avgLatencyMs / Math.max(resA.avgLatencyMs, resB.avgLatencyMs, 40)) * 100))}%` }}
                  >
                    {resA.avgLatencyMs}ms
                  </div>
                </div>
                <div className="h-6 rounded-md bg-neutral-100 dark:bg-neutral-800 p-0.5 overflow-hidden flex items-center">
                  <div
                    className={`h-full rounded flex items-center justify-end px-2 text-[10px] font-mono font-bold text-white transition-all ${
                      isBFaster ? 'bg-emerald-500' : 'bg-neutral-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(15, (resB.avgLatencyMs / Math.max(resA.avgLatencyMs, resB.avgLatencyMs, 40)) * 100))}%` }}
                  >
                    {resB.avgLatencyMs}ms
                  </div>
                </div>
              </div>
            </div>

            {/* Cached vs Uncached Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px]">
              <div>
                <span className="text-neutral-500 block mb-1">Warm Cache Response:</span>
                <div className="flex items-center justify-between font-mono font-semibold">
                  <span className={resA.cachedAvgMs <= resB.cachedAvgMs ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'}>
                    {resA.resolver.name}: {resA.cachedAvgMs}ms
                  </span>
                  <span className={resB.cachedAvgMs <= resA.cachedAvgMs ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'}>
                    {resB.resolver.name}: {resB.cachedAvgMs}ms
                  </span>
                </div>
              </div>

              <div>
                <span className="text-neutral-500 block mb-1">Cold Uncached Recursion:</span>
                <div className="flex items-center justify-between font-mono font-semibold">
                  <span className={resA.uncachedAvgMs <= resB.uncachedAvgMs ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'}>
                    {resA.resolver.name}: {resA.uncachedAvgMs}ms
                  </span>
                  <span className={resB.uncachedAvgMs <= resA.uncachedAvgMs ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'}>
                    {resB.resolver.name}: {resB.uncachedAvgMs}ms
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Side-by-Side Breakdown Matrix */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-950/70 border-b border-neutral-200 dark:border-neutral-800 font-bold text-xs text-neutral-900 dark:text-white">
              Side-by-Side Performance & Security Matrix
            </div>

            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
              {/* Row: Average Latency */}
              <div className="grid grid-cols-12 p-3 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <span className="col-span-4 font-medium text-neutral-600 dark:text-neutral-400">
                  Average Response Time
                </span>
                <div className="col-span-4 font-mono font-bold text-sm flex items-center gap-1.5">
                  <span className={isAFaster ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-800 dark:text-neutral-200'}>
                    {resA.avgLatencyMs} ms
                  </span>
                  {isAFaster && (
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded font-sans font-semibold">
                      Faster
                    </span>
                  )}
                </div>
                <div className="col-span-4 font-mono font-bold text-sm flex items-center gap-1.5">
                  <span className={isBFaster ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-800 dark:text-neutral-200'}>
                    {resB.avgLatencyMs} ms
                  </span>
                  {isBFaster && (
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded font-sans font-semibold">
                      Faster
                    </span>
                  )}
                </div>
              </div>

              {/* Row: Min / Max Latency */}
              <div className="grid grid-cols-12 p-3 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <span className="col-span-4 font-medium text-neutral-600 dark:text-neutral-400">
                  Min / Max Latency
                </span>
                <div className="col-span-4 font-mono text-neutral-800 dark:text-neutral-200">
                  {resA.minLatencyMs} ms / {resA.maxLatencyMs} ms
                </div>
                <div className="col-span-4 font-mono text-neutral-800 dark:text-neutral-200">
                  {resB.minLatencyMs} ms / {resB.maxLatencyMs} ms
                </div>
              </div>

              {/* Row: Jitter & Consistency */}
              <div className="grid grid-cols-12 p-3 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <div className="col-span-4 flex flex-col">
                  <span className="font-medium text-neutral-600 dark:text-neutral-400">
                    Jitter (Standard Deviation $\sigma$)
                  </span>
                  <span className="text-[10px] text-neutral-400">Lower indicates steady ping</span>
                </div>
                <div className="col-span-4 font-mono flex items-center gap-1.5">
                  <span className={`font-bold ${isAJitterBetter ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                    ±{resA.jitterMs} ms
                  </span>
                  {isAJitterBetter && (
                    <span className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1 py-0.2 rounded font-sans font-semibold">
                      More Consistent
                    </span>
                  )}
                </div>
                <div className="col-span-4 font-mono flex items-center gap-1.5">
                  <span className={`font-bold ${isBJitterBetter ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                    ±{resB.jitterMs} ms
                  </span>
                  {isBJitterBetter && (
                    <span className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1 py-0.2 rounded font-sans font-semibold">
                      More Consistent
                    </span>
                  )}
                </div>
              </div>

              {/* Row: Reliability */}
              <div className="grid grid-cols-12 p-3 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <span className="col-span-4 font-medium text-neutral-600 dark:text-neutral-400">
                  Query Reliability (Success Rate)
                </span>
                <div className="col-span-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{resA.successRate}%</span>
                </div>
                <div className="col-span-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{resB.successRate}%</span>
                </div>
              </div>

              {/* Row: DNSSEC Validation */}
              <div className="grid grid-cols-12 p-3 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <div className="col-span-4 flex flex-col">
                  <span className="font-medium text-neutral-600 dark:text-neutral-400">
                    DNSSEC Validation
                  </span>
                  <span className="text-[10px] text-neutral-400">Protects against DNS cache poisoning</span>
                </div>
                <div className="col-span-4 flex items-center gap-1.5">
                  {resA.resolver.features.dnssec ? (
                    <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span>Supported & Validating</span>
                    </span>
                  ) : (
                    <span className="text-neutral-500 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-neutral-400" />
                      <span>Not Enforced</span>
                    </span>
                  )}
                </div>
                <div className="col-span-4 flex items-center gap-1.5">
                  {resB.resolver.features.dnssec ? (
                    <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span>Supported & Validating</span>
                    </span>
                  ) : (
                    <span className="text-neutral-500 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-neutral-400" />
                      <span>Not Enforced</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Row: Malware & Phishing Shield */}
              <div className="grid grid-cols-12 p-3 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <span className="col-span-4 font-medium text-neutral-600 dark:text-neutral-400">
                  Malware & Phishing Shield
                </span>
                <div className="col-span-4 flex items-center gap-1.5">
                  {resA.resolver.features.malwareBlocking ? (
                    <span className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/20 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-500" />
                      <span>Active Threat Shield</span>
                    </span>
                  ) : (
                    <span className="text-neutral-400">Disabled (Neutral)</span>
                  )}
                </div>
                <div className="col-span-4 flex items-center gap-1.5">
                  {resB.resolver.features.malwareBlocking ? (
                    <span className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/20 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-500" />
                      <span>Active Threat Shield</span>
                    </span>
                  ) : (
                    <span className="text-neutral-400">Disabled (Neutral)</span>
                  )}
                </div>
              </div>

              {/* Row: Ad & Tracker Blocking */}
              <div className="grid grid-cols-12 p-3 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <span className="col-span-4 font-medium text-neutral-600 dark:text-neutral-400">
                  Ad & Tracker Sinkhole
                </span>
                <div className="col-span-4 flex items-center gap-1.5">
                  {resA.resolver.features.adBlocking ? (
                    <span className="text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20 font-semibold">
                      Enabled
                    </span>
                  ) : (
                    <span className="text-neutral-400">None</span>
                  )}
                </div>
                <div className="col-span-4 flex items-center gap-1.5">
                  {resB.resolver.features.adBlocking ? (
                    <span className="text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20 font-semibold">
                      Enabled
                    </span>
                  ) : (
                    <span className="text-neutral-400">None</span>
                  )}
                </div>
              </div>

              {/* Row: Privacy & No-Logging */}
              <div className="grid grid-cols-12 p-3 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <span className="col-span-4 font-medium text-neutral-600 dark:text-neutral-400">
                  Logging Policy
                </span>
                <div className="col-span-4">
                  {resA.resolver.features.noLogging ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Zero Query Logging
                    </span>
                  ) : (
                    <span className="text-neutral-500">Standard Telemetry</span>
                  )}
                </div>
                <div className="col-span-4">
                  {resB.resolver.features.noLogging ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Zero Query Logging
                    </span>
                  ) : (
                    <span className="text-neutral-500">Standard Telemetry</span>
                  )}
                </div>
              </div>

              {/* Row: Primary IPv4 */}
              <div className="grid grid-cols-12 p-3 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <span className="col-span-4 font-medium text-neutral-600 dark:text-neutral-400">
                  Primary IPv4
                </span>
                <div className="col-span-4 font-mono flex items-center gap-1.5">
                  <span>{resA.resolver.primaryIPv4}</span>
                  <button onClick={() => handleCopy(resA.resolver.primaryIPv4)} className="text-neutral-400 hover:text-blue-500">
                    {copiedText === resA.resolver.primaryIPv4 ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="col-span-4 font-mono flex items-center gap-1.5">
                  <span>{resB.resolver.primaryIPv4}</span>
                  <button onClick={() => handleCopy(resB.resolver.primaryIPv4)} className="text-neutral-400 hover:text-blue-500">
                    {copiedText === resB.resolver.primaryIPv4 ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Row: Secondary IPv4 */}
              <div className="grid grid-cols-12 p-3 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <span className="col-span-4 font-medium text-neutral-600 dark:text-neutral-400">
                  Secondary IPv4
                </span>
                <div className="col-span-4 font-mono text-neutral-700 dark:text-neutral-300">
                  {resA.resolver.secondaryIPv4 || 'None'}
                </div>
                <div className="col-span-4 font-mono text-neutral-700 dark:text-neutral-300">
                  {resB.resolver.secondaryIPv4 || 'None'}
                </div>
              </div>

              {/* Row: Anycast Infrastructure */}
              <div className="grid grid-cols-12 p-3 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <span className="col-span-4 font-medium text-neutral-600 dark:text-neutral-400">
                  Location & Routing
                </span>
                <div className="col-span-4 text-neutral-700 dark:text-neutral-300">
                  {resA.resolver.location}
                </div>
                <div className="col-span-4 text-neutral-700 dark:text-neutral-300">
                  {resB.resolver.location}
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-neutral-900 dark:text-white">
                  {resA.resolver.name}
                </div>
                <div className="text-[11px] font-mono text-neutral-500">
                  {resA.avgLatencyMs}ms · {resA.resolver.primaryIPv4}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectResolverForProbe(resA.resolver)}
                  className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  Probe
                </button>
                <button
                  onClick={() => onOpenAdapterModal(resA.resolver)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1"
                >
                  <Laptop className="w-3 h-3" />
                  <span>Apply DNS</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-neutral-900 dark:text-white">
                  {resB.resolver.name}
                </div>
                <div className="text-[11px] font-mono text-neutral-500">
                  {resB.avgLatencyMs}ms · {resB.resolver.primaryIPv4}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectResolverForProbe(resB.resolver)}
                  className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  Probe
                </button>
                <button
                  onClick={() => onOpenAdapterModal(resB.resolver)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1"
                >
                  <Laptop className="w-3 h-3" />
                  <span>Apply DNS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
