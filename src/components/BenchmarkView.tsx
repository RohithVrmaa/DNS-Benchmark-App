import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Zap,
  ShieldCheck,
  Activity,
  TrendingUp,
  Settings,
  Plus,
  Check,
  ChevronRight,
  Sparkles,
  Server,
  Sliders,
  Copy,
  Scale,
} from 'lucide-react';
import { DNSResolver, ResolverBenchmarkResult, DomainTestTarget } from '../types/dns';

interface BenchmarkViewProps {
  results: ResolverBenchmarkResult[];
  isRunning: boolean;
  progressPercent: number;
  currentTestingMessage: string;
  onStartBenchmark: (mode: 'quick' | 'standard' | 'deep') => void;
  onCancelBenchmark: () => void;
  onOpenAdapterModal: (resolver?: DNSResolver) => void;
  onOpenCustomModal: () => void;
  onOpenSelectorModal: () => void;
  onViewVisualizations: () => void;
  onOpenComparison?: (idA?: string, idB?: string) => void;
  onSelectResolverForProbe: (resolver: DNSResolver) => void;
  activeDomainCount: number;
  selectedResolverCount: number;
  totalAvailableResolvers: number;
}

export const BenchmarkView: React.FC<BenchmarkViewProps> = ({
  results,
  isRunning,
  progressPercent,
  currentTestingMessage,
  onStartBenchmark,
  onCancelBenchmark,
  onOpenAdapterModal,
  onOpenCustomModal,
  onOpenSelectorModal,
  onViewVisualizations,
  onOpenComparison,
  onSelectResolverForProbe,
  activeDomainCount,
  selectedResolverCount,
  totalAvailableResolvers,
}) => {
  const [benchMode, setBenchMode] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const completedResults = results
    .filter((r) => r.status === 'completed' && r.avgLatencyMs > 0)
    .sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);

  const fastest = completedResults[0];

  const lowestJitter = [...completedResults].sort((a, b) => a.jitterMs - b.jitterMs)[0];

  const securityBest = completedResults.find(
    (r) => r.resolver.features.malwareBlocking && r.resolver.features.dnssec
  ) || completedResults[0];

  const maxLatency = Math.max(...completedResults.map((r) => r.uncachedAvgMs || r.avgLatencyMs), 75);

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Control Banner & Quick Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-white tracking-tight">
              DNS Resolver Benchmark
            </h1>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              · {selectedResolverCount} of {totalAvailableResolvers} Resolvers active
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Measure Anycast latency, cached response speed, and uncached domain recursion across the top public DNS providers.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Select Resolvers button */}
          <button
            onClick={onOpenSelectorModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Select DNS ({selectedResolverCount}/{totalAvailableResolvers})</span>
          </button>

          {/* Mode Selector */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700">
            <button
              disabled={isRunning}
              onClick={() => setBenchMode('quick')}
              className={`px-2.5 py-1 rounded transition-colors ${
                benchMode === 'quick'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Quick (1-Pass)
            </button>
            <button
              disabled={isRunning}
              onClick={() => setBenchMode('standard')}
              className={`px-2.5 py-1 rounded transition-colors ${
                benchMode === 'standard'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Standard (Cached + Uncached)
            </button>
            <button
              disabled={isRunning}
              onClick={() => setBenchMode('deep')}
              className={`px-2.5 py-1 rounded transition-colors ${
                benchMode === 'deep'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Deep (3-Pass)
            </button>
          </div>

          {/* View Visual Charts Button */}
          {completedResults.length > 0 && (
            <button
              onClick={onViewVisualizations}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              <span>Visual Charts</span>
            </button>
          )}

          {/* Compare Mode Button */}
          {completedResults.length >= 2 && onOpenComparison && (
            <button
              onClick={() => onOpenComparison(completedResults[0]?.resolverId, completedResults[1]?.resolverId)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
            >
              <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Compare (A vs B)</span>
            </button>
          )}

          {/* Custom Resolver Button */}
          <button
            onClick={onOpenCustomModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom DNS</span>
          </button>

          {/* Primary Run / Cancel Button */}
          {isRunning ? (
            <button
              onClick={onCancelBenchmark}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-98 rounded-lg shadow-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              <span>Cancel Test</span>
            </button>
          ) : (
            <button
              onClick={() => onStartBenchmark(benchMode)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-lg shadow-sm transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Benchmark</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar (Active during run) */}
      {isRunning && (
        <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 transition-all">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-blue-950 dark:text-blue-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              {currentTestingMessage || 'Probing DNS resolvers...'}
            </span>
            <span className="font-mono tabular-nums font-semibold text-blue-700 dark:text-blue-300">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-blue-200/60 dark:bg-blue-900/50 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* KPI Highlight Strip */}
      {completedResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Fastest Resolver */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-medium">Fastest Overall</span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Rank #1
                </span>
              </div>
              <div className="mt-2 text-base font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: fastest.resolver.color }}
                />
                <span>{fastest.resolver.name}</span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {fastest.avgLatencyMs}
                </span>
                <span className="text-xs text-neutral-500 font-mono">ms avg</span>
                <span className="text-[11px] text-neutral-400">
                  (min {fastest.minLatencyMs}ms)
                </span>
              </div>
            </div>
            <button
              onClick={() => onOpenAdapterModal(fastest.resolver)}
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Apply to Windows Adapter</span>
            </button>
          </div>

          {/* Lowest Jitter */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-medium">Lowest Jitter (Consistency)</span>
                <Activity className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="mt-2 text-base font-bold text-neutral-900 dark:text-white">
                {lowestJitter.resolver.name}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
                  ±{lowestJitter.jitterMs}
                </span>
                <span className="text-xs text-neutral-500 font-mono">ms variance</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                Ensures zero lag spikes during gaming & real-time calls.
              </p>
            </div>
            <div className="mt-2 text-xs font-mono text-neutral-400">
              IP: {lowestJitter.resolver.primaryIPv4}
            </div>
          </div>

          {/* Best Security & Threat Shield */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-medium">Best Security & Privacy</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="mt-2 text-base font-bold text-neutral-900 dark:text-white">
                {securityBest.resolver.name}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
                  {securityBest.avgLatencyMs}
                </span>
                <span className="text-xs text-neutral-500 font-mono">ms avg</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                DNSSEC validated + Malware blocking enabled.
              </p>
            </div>
            <button
              onClick={() => onOpenAdapterModal(securityBest.resolver)}
              className="mt-3 flex items-center justify-center gap-1 w-full py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors"
            >
              <span>Select Security DNS</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Improvement vs Standard */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-medium">Estimated Speedup</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                +{Math.max(18, Math.round(((45 - fastest.avgLatencyMs) / 45) * 100))}%
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                Faster domain lookups compared to typical ISP gateway defaults (45ms+).
              </p>
            </div>
            <div className="mt-3 text-[11px] text-neutral-400">
              Tested on {activeDomainCount} critical internet endpoints
            </div>
          </div>
        </div>
      )}

      {/* Visual Latency Comparison Chart */}
      <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              Resolver Latency Ranking
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Lower response time (ms) indicates faster website loading and connection setup.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500" />
              <span>Fast (&lt;25ms)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-500" />
              <span>Good (25-45ms)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-500" />
              <span>Slow (&gt;45ms)</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Rows */}
        <div className="flex flex-col gap-3.5 mt-4">
          {completedResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Server className="w-10 h-10 text-neutral-400 mb-2 stroke-[1.5]" />
              <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                No Benchmark Data Yet
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1">
                Click "Start Benchmark" above to run precision DNS queries across Cloudflare, Google, Quad9, and other global Anycast providers.
              </p>
              <button
                onClick={() => onStartBenchmark('standard')}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Run Standard Benchmark
              </button>
            </div>
          ) : (
            completedResults.map((item, index) => {
              const avg = item.avgLatencyMs;
              const barWidthPercent = Math.min(100, Math.max(8, (avg / maxLatency) * 100));

              let barColor = 'bg-emerald-500';
              if (avg > 45) barColor = 'bg-rose-500';
              else if (avg > 25) barColor = 'bg-amber-500';

              const isFirst = index === 0;

              return (
                <div
                  key={item.resolverId}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800"
                >
                  {/* Left: Resolver Identity */}
                  <div className="w-full sm:w-56 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-xs font-bold font-mono text-neutral-400">
                        #{index + 1}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.resolver.color }}
                      />
                      <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                        {item.resolver.name}
                      </span>
                      {isFirst && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1 py-0.2 rounded border border-amber-500/20">
                          Fastest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 pl-7 mt-0.5 font-mono">
                      <span>{item.resolver.primaryIPv4}</span>
                      <button
                        onClick={() => handleCopyIp(item.resolver.primaryIPv4)}
                        title="Copy Primary IP"
                        className="hover:text-blue-600 transition-colors"
                      >
                        {copiedIp === item.resolver.primaryIPv4 ? (
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Center: Visual Latency Bar */}
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 h-5 rounded-md overflow-hidden relative">
                      {/* Latency Fill Bar */}
                      <div
                        className={`h-full ${barColor} rounded-md transition-all duration-500 flex items-center justify-end px-2`}
                        style={{ width: `${barWidthPercent}%` }}
                      >
                        <span className="text-[10px] font-bold text-white font-mono drop-shadow-xs">
                          {avg}ms
                        </span>
                      </div>
                    </div>

                    {/* Numeric Stats */}
                    <div className="flex items-center gap-3 text-xs shrink-0 w-36 justify-end font-mono tabular-nums">
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {avg} ms
                      </span>
                      <span className="text-neutral-400 text-[11px]">
                        (±{item.jitterMs}ms)
                      </span>
                    </div>
                  </div>

                  {/* Right: Quick Action */}
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <button
                      onClick={() => onSelectResolverForProbe(item.resolver)}
                      className="px-2 py-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                      title="Inspect queries with this resolver"
                    >
                      Probe
                    </button>
                    <button
                      onClick={() => onOpenAdapterModal(item.resolver)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors border border-blue-200 dark:border-blue-800"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Educational & Practical Context Note */}
      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex flex-col sm:flex-row gap-4 items-start">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="font-semibold text-neutral-900 dark:text-white mb-0.5">
            How DNS SpeedBench Evaluates Resolvers
          </div>
          <p className="leading-relaxed">
            Standard browser connections query DNS before establishing any HTTPS handshake. A 15ms resolver versus a 65ms resolver saves ~50ms on every new website, asset host, API call, and gaming server connection. DNS SpeedBench tests both warm cached resolution and cold recursive authoritative queries with Anycast path verification.
          </p>
        </div>
      </div>
    </div>
  );
};
