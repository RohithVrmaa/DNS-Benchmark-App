import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Check,
  CheckSquare,
  Square,
  Shield,
  Zap,
  Filter,
  Sparkles,
  Server,
} from 'lucide-react';
import { DNSResolver } from '../types/dns';

interface ResolverSelectorModalProps {
  resolvers: DNSResolver[];
  selectedIds: string[];
  onSaveSelection: (newSelectedIds: string[]) => void;
  onClose: () => void;
  onStartWithSelection: (newSelectedIds: string[]) => void;
}

export const ResolverSelectorModal: React.FC<ResolverSelectorModalProps> = ({
  resolvers,
  selectedIds,
  onSaveSelection,
  onClose,
  onStartWithSelection,
}) => {
  const [currentSelected, setCurrentSelected] = useState<string[]>(selectedIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    resolvers.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [resolvers]);

  const filteredResolvers = useMemo(() => {
    return resolvers.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.primaryIPv4.includes(searchQuery) ||
        r.provider.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (activeCategory !== 'all' && r.category !== activeCategory) return false;
      return true;
    });
  }, [resolvers, searchQuery, activeCategory]);

  const handleToggle = (id: string) => {
    if (currentSelected.includes(id)) {
      setCurrentSelected(currentSelected.filter((item) => item !== id));
    } else {
      setCurrentSelected([...currentSelected, id]);
    }
  };

  const handleSelectPreset = (preset: 'all' | 'top10' | 'security' | 'adblock' | 'none') => {
    if (preset === 'all') {
      setCurrentSelected(resolvers.map((r) => r.id));
    } else if (preset === 'none') {
      setCurrentSelected([]);
    } else if (preset === 'top10') {
      const top10Ids = [
        'cloudflare',
        'google',
        'quad9',
        'opendns',
        'adguard',
        'nextdns',
        'controld',
        'dns0-eu',
        'mullvad',
        'level3-primary',
      ];
      setCurrentSelected(resolvers.filter((r) => top10Ids.includes(r.id)).map((r) => r.id));
    } else if (preset === 'security') {
      setCurrentSelected(
        resolvers
          .filter((r) => r.features.malwareBlocking || r.category === 'Security & Privacy')
          .map((r) => r.id)
      );
    } else if (preset === 'adblock') {
      setCurrentSelected(
        resolvers.filter((r) => r.features.adBlocking || r.category === 'Ad Blocking').map((r) => r.id)
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Select Benchmark DNS Resolvers
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Choose from over 50 public Anycast resolvers or private custom servers to benchmark
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar: Search & Presets */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col gap-3 bg-neutral-50/50 dark:bg-neutral-950/30 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search across 50+ DNS providers, names, or IP addresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Selection Counter */}
            <div className="flex items-center gap-2 font-medium shrink-0">
              <span className="text-neutral-500">Selected:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/20">
                {currentSelected.length} of {resolvers.length}
              </span>
            </div>
          </div>

          {/* Quick Presets Strip */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-neutral-400 font-medium">Quick Presets:</span>
            <button
              onClick={() => handleSelectPreset('top10')}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-blue-400 transition-colors"
            >
              Top 10 Global Anycast
            </button>
            <button
              onClick={() => handleSelectPreset('all')}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
            >
              All 50+ Public DNS
            </button>
            <button
              onClick={() => handleSelectPreset('security')}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-emerald-400 transition-colors"
            >
              Threat Shield & Security
            </button>
            <button
              onClick={() => handleSelectPreset('adblock')}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-purple-400 transition-colors"
            >
              Ad-Blocking Sinkholes
            </button>
            <button
              onClick={() => handleSelectPreset('none')}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Resolvers Selection Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {filteredResolvers.map((resolver) => {
            const isChecked = currentSelected.includes(resolver.id);

            return (
              <div
                key={resolver.id}
                onClick={() => handleToggle(resolver.id)}
                className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-2.5 ${
                  isChecked
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-2xs'
                    : 'bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-800 opacity-80 hover:opacity-100 hover:border-neutral-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="w-4 h-4 text-neutral-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: resolver.color }}
                    />
                    <span className="font-semibold text-neutral-900 dark:text-white truncate">
                      {resolver.name}
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                    {resolver.primaryIPv4}
                    {resolver.secondaryIPv4 && ` / ${resolver.secondaryIPv4}`}
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-neutral-400">
                    <span className="truncate">{resolver.provider}</span>
                    {resolver.features.adBlocking && (
                      <span className="text-purple-600 dark:text-purple-400 font-medium">· AdBlock</span>
                    )}
                    {resolver.features.malwareBlocking && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">· Security</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70 text-xs">
          <div className="text-neutral-500 text-[11px]">
            {currentSelected.length} resolvers selected for next benchmark run.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSaveSelection(currentSelected);
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 transition-colors"
            >
              Save Selection
            </button>
            <button
              disabled={currentSelected.length === 0}
              onClick={() => {
                onSaveSelection(currentSelected);
                onStartWithSelection(currentSelected);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Benchmark Selected ({currentSelected.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
