import React, { useState, useMemo } from 'react';
import {
  Search,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  ArrowUpDown,
  FileSpreadsheet,
  Zap,
  Globe,
  SlidersHorizontal,
  Scale,
  CheckSquare,
  Square,
  ArrowRight,
  X,
} from 'lucide-react';
import { ResolverBenchmarkResult, DNSResolver } from '../types/dns';

interface ResultsTableProps {
  results: ResolverBenchmarkResult[];
  onOpenAdapterModal: (resolver: DNSResolver) => void;
  onSelectResolverForProbe: (resolver: DNSResolver) => void;
  onExportCsv: () => void;
  onOpenComparison: (idA?: string, idB?: string) => void;
}

type SortField = 'avgLatencyMs' | 'jitterMs' | 'cachedAvgMs' | 'uncachedAvgMs' | 'successRate';

export const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  onOpenAdapterModal,
  onSelectResolverForProbe,
  onExportCsv,
  onOpenComparison,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featureFilter, setFeatureFilter] = useState<'all' | 'dnssec' | 'malware' | 'adblock'>('all');
  const [sortField, setSortField] = useState<SortField>('avgLatencyMs');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleToggleCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        // Replace second one
        setSelectedForCompare([selectedForCompare[0], id]);
      } else {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const filteredAndSorted = useMemo(() => {
    return results
      .filter((item) => {
        const matchesQuery =
          item.resolver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.resolver.primaryIPv4.includes(searchQuery) ||
          item.resolver.provider.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesQuery) return false;

        if (featureFilter === 'dnssec' && !item.resolver.features.dnssec) return false;
        if (featureFilter === 'malware' && !item.resolver.features.malwareBlocking) return false;
        if (featureFilter === 'adblock' && !item.resolver.features.adBlocking) return false;

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (valA === 0) valA = 9999;
        if (valB === 0) valB = 9999;

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [results, searchQuery, featureFilter, sortField, sortAsc]);

  const compareResolverA = results.find((r) => r.resolverId === selectedForCompare[0]);
  const compareResolverB = results.find((r) => r.resolverId === selectedForCompare[1]);

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-7xl mx-auto w-full relative">
      {/* Table Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Filter by name, provider, or IP (e.g. 1.1.1.1, Google)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Segmented Feature Filter */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setFeatureFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                featureFilter === 'all'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              All Resolvers
            </button>
            <button
              onClick={() => setFeatureFilter('dnssec')}
              className={`px-2.5 py-1 rounded transition-colors ${
                featureFilter === 'dnssec'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              DNSSEC
            </button>
            <button
              onClick={() => setFeatureFilter('malware')}
              className={`px-2.5 py-1 rounded transition-colors ${
                featureFilter === 'malware'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Threat Shield
            </button>
            <button
              onClick={() => setFeatureFilter('adblock')}
              className={`px-2.5 py-1 rounded transition-colors ${
                featureFilter === 'adblock'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Ad-Blocking
            </button>
          </div>

          {/* Comparison Mode Trigger */}
          <button
            onClick={() => onOpenComparison(selectedForCompare[0], selectedForCompare[1])}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg border transition-all ${
              selectedForCompare.length === 2
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs'
                : selectedForCompare.length === 1
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                : 'bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compare Mode</span>
            {selectedForCompare.length > 0 && (
              <span className="font-mono text-[11px] bg-blue-200/60 dark:bg-blue-900/60 px-1.5 py-0.2 rounded">
                {selectedForCompare.length}/2
              </span>
            )}
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Floating Comparison Tray (when 1 or 2 resolvers are checked) */}
      {selectedForCompare.length > 0 && (
        <div className="sticky top-2 z-20 p-3 rounded-xl bg-neutral-900 text-white shadow-xl border border-neutral-700 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <Scale className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-neutral-300">Compare Selected:</span>
              <span className="font-bold text-white bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
                {compareResolverA ? compareResolverA.resolver.name : 'Select #1'}
              </span>
              <span className="text-neutral-500 font-bold">vs</span>
              <span className="font-bold text-white bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
                {compareResolverB ? compareResolverB.resolver.name : 'Select #2'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedForCompare([])}
              className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
            >
              Clear
            </button>
            <button
              disabled={selectedForCompare.length < 2}
              onClick={() => onOpenComparison(selectedForCompare[0], selectedForCompare[1])}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm transition-all"
            >
              <span>View Side-by-Side Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* High-Density Data Grid */}
      <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70 text-neutral-600 dark:text-neutral-400 font-semibold select-none">
                <th className="py-2.5 px-3 w-10 text-center" title="Select two resolvers to compare">
                  Compare
                </th>
                <th className="py-2.5 px-3.5 w-12 text-center">#</th>
                <th className="py-2.5 px-3.5">Resolver</th>
                <th className="py-2.5 px-3.5">IP Addresses</th>
                <th
                  onClick={() => handleSort('avgLatencyMs')}
                  className="py-2.5 px-3.5 text-right cursor-pointer hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Avg Latency</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3.5 text-right">Min / Max</th>
                <th
                  onClick={() => handleSort('jitterMs')}
                  className="py-2.5 px-3.5 text-right cursor-pointer hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Jitter</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cachedAvgMs')}
                  className="py-2.5 px-3.5 text-right cursor-pointer hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cached / Uncached</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('successRate')}
                  className="py-2.5 px-3.5 text-center cursor-pointer hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Reliability</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3.5 text-center">Security & Features</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-normal">
              {filteredAndSorted.map((item, index) => {
                const isFastest = index === 0 && item.avgLatencyMs > 0;
                const isSelectedForCompare = selectedForCompare.includes(item.resolverId);

                let latencyBadge = 'text-emerald-600 dark:text-emerald-400 font-bold';
                if (item.avgLatencyMs > 45) {
                  latencyBadge = 'text-rose-600 dark:text-rose-400 font-bold';
                } else if (item.avgLatencyMs > 25) {
                  latencyBadge = 'text-amber-600 dark:text-amber-400 font-bold';
                }

                return (
                  <tr
                    key={item.resolverId}
                    className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors h-11 ${
                      isSelectedForCompare ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    {/* Compare Selection Checkbox */}
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleToggleCompare(item.resolverId)}
                        className="p-1 rounded text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title={
                          isSelectedForCompare
                            ? 'Remove from comparison'
                            : 'Select to compare (max 2)'
                        }
                      >
                        {isSelectedForCompare ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
                        )}
                      </button>
                    </td>

                    {/* Rank */}
                    <td className="py-2 px-3.5 text-center font-mono font-semibold text-neutral-400">
                      {index + 1}
                    </td>

                    {/* Resolver Info */}
                    <td className="py-2 px-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.resolver.color }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5 truncate">
                            {item.resolver.name}
                            {isFastest && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold shrink-0">
                                ★ Fastest
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-neutral-400 truncate">
                            {item.resolver.provider}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* IPs */}
                    <td className="py-2 px-3.5">
                      <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                        <span>{item.resolver.primaryIPv4}</span>
                        <button
                          onClick={() => handleCopyIp(item.resolver.primaryIPv4)}
                          className="hover:text-blue-600 transition-colors"
                          title="Copy IP"
                        >
                          {copiedIp === item.resolver.primaryIPv4 ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-neutral-400" />
                          )}
                        </button>
                        {item.resolver.secondaryIPv4 && (
                          <span className="text-neutral-400 text-[10px]">
                            / {item.resolver.secondaryIPv4}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Avg Latency */}
                    <td className="py-2 px-3.5 text-right font-mono tabular-nums">
                      {item.avgLatencyMs > 0 ? (
                        <span className={`text-sm ${latencyBadge}`}>
                          {item.avgLatencyMs} ms
                        </span>
                      ) : (
                        <span className="text-neutral-400">--</span>
                      )}
                    </td>

                    {/* Min / Max */}
                    <td className="py-2 px-3.5 text-right font-mono tabular-nums text-neutral-500 dark:text-neutral-400 text-[11px]">
                      {item.avgLatencyMs > 0 ? (
                        <span>
                          {item.minLatencyMs} / {item.maxLatencyMs} ms
                        </span>
                      ) : (
                        <span>--</span>
                      )}
                    </td>

                    {/* Jitter */}
                    <td className="py-2 px-3.5 text-right font-mono tabular-nums text-neutral-600 dark:text-neutral-300">
                      {item.avgLatencyMs > 0 ? <span>±{item.jitterMs} ms</span> : <span>--</span>}
                    </td>

                    {/* Cached / Uncached */}
                    <td className="py-2 px-3.5 text-right font-mono tabular-nums text-neutral-600 dark:text-neutral-300">
                      {item.avgLatencyMs > 0 ? (
                        <span>
                          {item.cachedAvgMs} / {item.uncachedAvgMs} ms
                        </span>
                      ) : (
                        <span>--</span>
                      )}
                    </td>

                    {/* Reliability */}
                    <td className="py-2 px-3.5 text-center font-mono tabular-nums">
                      {item.avgLatencyMs > 0 ? (
                        <span
                          className={`font-semibold ${
                            item.successRate >= 95
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600'
                          }`}
                        >
                          {item.successRate}%
                        </span>
                      ) : (
                        <span className="text-neutral-400">Ready</span>
                      )}
                    </td>

                    {/* Features */}
                    <td className="py-2 px-3.5">
                      <div className="flex items-center justify-center gap-1.5 text-[11px]">
                        {item.resolver.features.dnssec && (
                          <span
                            className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20"
                            title="DNSSEC validation enabled"
                          >
                            DNSSEC
                          </span>
                        )}
                        {item.resolver.features.malwareBlocking && (
                          <span
                            className="text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-500/20"
                            title="Malware and phishing blocklist"
                          >
                            Shield
                          </span>
                        )}
                        {item.resolver.features.adBlocking && (
                          <span
                            className="text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/20"
                            title="Ad and telemetry tracker blocker"
                          >
                            AdBlock
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            if (selectedForCompare.length === 1 && selectedForCompare[0] !== item.resolverId) {
                              onOpenComparison(selectedForCompare[0], item.resolverId);
                            } else {
                              handleToggleCompare(item.resolverId);
                            }
                          }}
                          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                            isSelectedForCompare
                              ? 'bg-blue-600 text-white'
                              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          }`}
                          title="Compare with another resolver"
                        >
                          {isSelectedForCompare ? 'Selected' : 'Compare'}
                        </button>
                        <button
                          onClick={() => onSelectResolverForProbe(item.resolver)}
                          className="px-2 py-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                          title="Run single query probe"
                        >
                          Probe
                        </button>
                        <button
                          onClick={() => onOpenAdapterModal(item.resolver)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors border border-blue-200 dark:border-blue-800"
                        >
                          Apply DNS
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
