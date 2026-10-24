import React, { useState } from 'react';
import {
  History,
  Calendar,
  Clock,
  Trash2,
  Download,
  RotateCcw,
  Zap,
  TrendingDown,
  TrendingUp,
  Award,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  FileText,
  Activity,
  Server,
  Laptop,
} from 'lucide-react';
import { BenchmarkSessionHistory, ResolverBenchmarkResult, DNSResolver } from '../types/dns';
import { generateResultsCsv, downloadFile } from '../services/windowsScriptGenerator';

interface BenchmarkHistoryViewProps {
  history: BenchmarkSessionHistory[];
  onLoadSession: (session: BenchmarkSessionHistory) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAllHistory: () => void;
  onOpenAdapterModal: (resolver: DNSResolver) => void;
  currentFastestMs?: number;
}

export const BenchmarkHistoryView: React.FC<BenchmarkHistoryViewProps> = ({
  history,
  onLoadSession,
  onDeleteSession,
  onClearAllHistory,
  onOpenAdapterModal,
  currentFastestMs,
}) => {
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<BenchmarkSessionHistory | null>(null);

  const handleExportSessionCsv = (session: BenchmarkSessionHistory) => {
    const csv = generateResultsCsv(session.results);
    downloadFile(csv, `DNS_Benchmark_${session.id}.csv`, 'text/csv');
  };

  const handleExportSessionJson = (session: BenchmarkSessionHistory) => {
    const jsonStr = JSON.stringify(session, null, 2);
    downloadFile(jsonStr, `DNS_Benchmark_${session.id}.json`, 'application/json');
  };

  // Historical minimum
  const allTimeFastest = history.length > 0
    ? [...history].sort((a, b) => a.fastestLatencyMs - b.fastestLatencyMs)[0]
    : null;

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              Benchmark Session History
            </h2>
            <span className="text-xs text-neutral-500">
              ({history.length} historical runs saved locally)
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Compare DNS performance over time to detect ISP routing changes, peering shifts, or network congestion.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear all stored benchmark history?')) {
                onClearAllHistory();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Historical Trend Overview Cards */}
      {history.length > 0 && allTimeFastest && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
              All-Time Best Latency
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {allTimeFastest.fastestLatencyMs}
              </span>
              <span className="text-xs text-neutral-500 font-mono">ms</span>
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 truncate">
              {allTimeFastest.fastestResolverName} ({allTimeFastest.dateFormatted})
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
              Total Recorded Sessions
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
                {history.length}
              </span>
              <span className="text-xs text-neutral-500">runs saved in localStorage</span>
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Zero cloud upload · 100% private & offline
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
              Latest vs Baseline
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                {history[0].fastestLatencyMs} ms
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                (median {history[0].medianLatencyMs}ms)
              </span>
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Latest test on {history[0].dateFormatted}
            </div>
          </div>
        </div>
      )}

      {/* History Sessions List */}
      <div className="flex flex-col gap-3">
        {history.length === 0 ? (
          <div className="p-12 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center flex flex-col items-center justify-center">
            <History className="w-10 h-10 text-neutral-400 mb-2 stroke-[1.5]" />
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              No Benchmark History Recorded Yet
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1">
              Every time you complete a benchmark, the results are automatically stamped with your local timestamp and saved for longitudinal comparison.
            </p>
          </div>
        ) : (
          history.map((session, index) => {
            const isLatest = index === 0;

            return (
              <div
                key={session.id}
                className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all text-xs"
              >
                {/* Session Header and Timestamp */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {session.dateFormatted}
                      </span>
                      {isLatest && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          Latest Run
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-semibold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded">
                        {session.mode} Mode
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-3">
                      <span>{session.resolversCount} Resolvers benchmarked</span>
                      <span>·</span>
                      <span>{session.avgSuccessRate}% Success rate</span>
                    </div>
                  </div>
                </div>

                {/* Key Metrics from Run */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-sans block uppercase">
                      Fastest Resolver
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {session.fastestLatencyMs} ms
                    </span>
                    <div className="text-[10px] text-neutral-500 truncate max-w-[130px]">
                      {session.fastestResolverName}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-400 font-sans block uppercase">
                      Median Latency
                    </span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">
                      {session.medianLatencyMs} ms
                    </span>
                    <div className="text-[10px] text-neutral-400">Anycast center</div>
                  </div>

                  <div className="hidden sm:block">
                    <span className="text-[10px] text-neutral-400 font-sans block uppercase">
                      Lowest Jitter
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                      ±{session.lowestJitterMs} ms
                    </span>
                    <div className="text-[10px] text-neutral-500 truncate max-w-[130px]">
                      {session.lowestJitterResolverName}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => onLoadSession(session)}
                    className="flex items-center gap-1 px-3 py-1.5 font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                    title="Load this run into the dashboard"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Load Session</span>
                  </button>

                  <button
                    onClick={() => setSelectedSessionForDetails(session)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    title="Inspect session results"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleExportSessionCsv(session)}
                    className="p-1.5 text-neutral-500 hover:text-emerald-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    title="Export session CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteSession(session.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                    title="Delete session record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Session Details Modal Inspector */}
      {selectedSessionForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-sm text-neutral-900 dark:text-white">
                  Historical Run Details ({selectedSessionForDetails.dateFormatted})
                </span>
              </div>
              <button
                onClick={() => setSelectedSessionForDetails(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                    <th className="py-2">Resolver</th>
                    <th className="py-2">IP</th>
                    <th className="py-2 text-right">Avg RTT</th>
                    <th className="py-2 text-right">Min / Max</th>
                    <th className="py-2 text-right">Jitter</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
                  {selectedSessionForDetails.results.map((res, i) => (
                    <tr key={res.resolverId} className="h-9 hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="py-1.5 font-sans font-semibold text-neutral-900 dark:text-white">
                        {i + 1}. {res.resolver.name}
                      </td>
                      <td className="py-1.5 text-neutral-500 text-[11px]">{res.resolver.primaryIPv4}</td>
                      <td className="py-1.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {res.avgLatencyMs} ms
                      </td>
                      <td className="py-1.5 text-right text-neutral-500 text-[11px]">
                        {res.minLatencyMs} / {res.maxLatencyMs} ms
                      </td>
                      <td className="py-1.5 text-right text-neutral-600 dark:text-neutral-400">
                        ±{res.jitterMs} ms
                      </td>
                      <td className="py-1.5 text-right font-sans">
                        <button
                          onClick={() => {
                            onOpenAdapterModal(res.resolver);
                            setSelectedSessionForDetails(null);
                          }}
                          className="px-2 py-0.5 text-[10px] font-semibold text-blue-600 hover:underline"
                        >
                          Apply DNS
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950/70 text-xs">
              <span className="text-neutral-500">
                Mode: {selectedSessionForDetails.mode} · Resolvers: {selectedSessionForDetails.resolversCount}
              </span>
              <button
                onClick={() => {
                  onLoadSession(selectedSessionForDetails);
                  setSelectedSessionForDetails(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Restore This Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
