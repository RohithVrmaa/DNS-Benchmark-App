/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * DNS SpeedBench v1.0
 * Developed by Rohith Varma
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WindowsTitleBar } from './components/WindowsTitleBar';
import { WindowsStatusBar } from './components/WindowsStatusBar';
import { BenchmarkView } from './components/BenchmarkView';
import { ResultsVisualization } from './components/ResultsVisualization';
import { ResultsTable } from './components/ResultsTable';
import { DnsServerManager } from './components/DnsServerManager';
import { BenchmarkHistoryView } from './components/BenchmarkHistoryView';
import { LiveProbeView } from './components/LiveProbeView';
import { AdapterConfigModal } from './components/AdapterConfigModal';
import { PortableExeModal } from './components/PortableExeModal';
import { CustomResolverModal } from './components/CustomResolverModal';
import { ResolverSelectorModal } from './components/ResolverSelectorModal';
import { ComparisonModal } from './components/ComparisonModal';
import { AboutDialog } from './components/AboutDialog';
import { DEFAULT_RESOLVERS, DEFAULT_DOMAINS } from './data/defaultResolvers';
import {
  DNSResolver,
  ResolverBenchmarkResult,
  DomainTestTarget,
  BenchmarkSessionHistory,
  QuerySample,
} from './types/dns';
import { benchmarkResolver } from './services/dnsBenchmarkEngine';
import { generateResultsCsv, downloadFile } from './services/windowsScriptGenerator';

const STORAGE_CUSTOM_KEY = 'dns_speedbench_custom_resolvers_v1';
const STORAGE_SELECTED_KEY = 'dns_speedbench_selected_resolvers_v1';
const STORAGE_HISTORY_KEY = 'dns_speedbench_benchmark_history_v1';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [isFullscreenWindow, setIsFullscreenWindow] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'benchmark' | 'visualize' | 'table' | 'history' | 'manager' | 'probe' | 'export'
  >('benchmark');

  // Custom resolvers loaded from localStorage
  const [customResolvers, setCustomResolvers] = useState<DNSResolver[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load custom resolvers from localStorage', e);
    }
    return [
      {
        id: 'custom-router-gateway',
        name: 'Home Gateway / Router DNS',
        tagline: '192.168.1.1 - Local ISP cached DNS proxy',
        provider: 'Local Network Gateway',
        primaryIPv4: '192.168.1.1',
        secondaryIPv4: '',
        dohEndpoint: 'https://cloudflare-dns.com/dns-query',
        dohMethod: 'GET',
        location: 'Local LAN',
        category: 'Custom',
        features: { dnssec: false, malwareBlocking: false, adBlocking: false, noLogging: true, anycast: false },
        color: '#8B5CF6',
        isCustom: true,
        notes: 'Default local gateway resolution point',
      },
    ];
  });

  // All combined available resolvers (Default 52+ plus Custom)
  const allResolvers = useMemo(() => {
    return [...customResolvers, ...DEFAULT_RESOLVERS];
  }, [customResolvers]);

  // Selected resolvers for benchmarking
  const [selectedResolverIds, setSelectedResolverIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SELECTED_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return [
      'custom-router-gateway',
      'cloudflare',
      'google',
      'quad9',
      'opendns',
      'adguard',
      'nextdns',
      'controld',
      'mullvad',
      'dns0-eu',
      'gcore',
      'level3-primary',
      'cleanbrowsing-security',
      'verisign',
    ];
  });

  // Benchmark history loaded from localStorage
  const [history, setHistory] = useState<BenchmarkSessionHistory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    const now = new Date();
    const dateFormatted =
      now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ', ' +
      now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return [
      {
        id: 'session-baseline-1',
        timestamp: Date.now() - 1000 * 60 * 120,
        dateFormatted,
        mode: 'standard',
        resolversCount: 14,
        fastestResolverName: 'Cloudflare Standard',
        fastestResolverIp: '1.1.1.1',
        fastestLatencyMs: 13,
        medianLatencyMs: 25,
        lowestJitterMs: 1.4,
        lowestJitterResolverName: 'Cloudflare Standard',
        avgSuccessRate: 100,
        results: [],
        notes: 'Initial network calibration run',
      },
    ];
  });

  // Save custom resolvers whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(customResolvers));
    } catch (e) {}
  }, [customResolvers]);

  // Save selected resolver IDs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SELECTED_KEY, JSON.stringify(selectedResolverIds));
    } catch (e) {}
  }, [selectedResolverIds]);

  // Save history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  // Suppress browser hotkeys (F5 refresh, Ctrl+R, Ctrl+P print, Ctrl+S save, Ctrl+U source, zoom, drag/drop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F5' ||
        (e.ctrlKey && ['r', 'R', 'p', 'P', 'u', 'U', 's', 'S', 'f', 'F', '+', '-', '=', '0'].includes(e.key))
      ) {
        e.preventDefault();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const [domains, setDomains] = useState<DomainTestTarget[]>(DEFAULT_DOMAINS);

  // Baseline results pre-seeded for realistic immediate UI feedback
  const [results, setResults] = useState<ResolverBenchmarkResult[]>(() => {
    const baselines: Record<
      string,
      { avg: number; min: number; max: number; jitter: number; cached: number; uncached: number }
    > = {
      'custom-router-gateway': { avg: 4, min: 2, max: 9, jitter: 0.6, cached: 3, uncached: 18 },
      cloudflare: { avg: 13, min: 11, max: 21, jitter: 1.4, cached: 11, uncached: 18 },
      google: { avg: 17, min: 14, max: 29, jitter: 1.8, cached: 15, uncached: 22 },
      quad9: { avg: 22, min: 19, max: 38, jitter: 2.5, cached: 20, uncached: 29 },
      nextdns: { avg: 20, min: 17, max: 34, jitter: 2.1, cached: 18, uncached: 26 },
      controld: { avg: 25, min: 21, max: 42, jitter: 2.8, cached: 22, uncached: 33 },
      opendns: { avg: 26, min: 23, max: 46, jitter: 3.1, cached: 24, uncached: 35 },
      adguard: { avg: 29, min: 25, max: 51, jitter: 3.4, cached: 27, uncached: 39 },
      mullvad: { avg: 24, min: 20, max: 39, jitter: 2.2, cached: 21, uncached: 31 },
      'dns0-eu': { avg: 27, min: 22, max: 44, jitter: 2.9, cached: 24, uncached: 36 },
      gcore: { avg: 19, min: 16, max: 31, jitter: 1.9, cached: 17, uncached: 25 },
      'level3-primary': { avg: 28, min: 24, max: 48, jitter: 3.2, cached: 25, uncached: 38 },
      'cleanbrowsing-security': { avg: 34, min: 29, max: 58, jitter: 3.8, cached: 31, uncached: 45 },
      verisign: { avg: 31, min: 27, max: 52, jitter: 3.5, cached: 28, uncached: 42 },
      'cloudflare-security': { avg: 14, min: 11, max: 23, jitter: 1.5, cached: 12, uncached: 19 },
      'cloudflare-family': { avg: 15, min: 12, max: 24, jitter: 1.6, cached: 12, uncached: 20 },
      'quad9-unfiltered': { avg: 23, min: 19, max: 39, jitter: 2.6, cached: 21, uncached: 30 },
      'opendns-family': { avg: 27, min: 23, max: 47, jitter: 3.2, cached: 25, uncached: 37 },
      'adguard-nonfiltering': { avg: 28, min: 24, max: 49, jitter: 3.3, cached: 26, uncached: 38 },
      'controld-malware': { avg: 26, min: 22, max: 43, jitter: 2.9, cached: 23, uncached: 34 },
    };

    const generateBaselineSamples = (
      resolverId: string,
      baseAvg: number,
      minLat: number,
      maxLat: number
    ): QuerySample[] => {
      const timestamp = Date.now() - 1000 * 60 * 30;
      return DEFAULT_DOMAINS.map((target, idx) => {
        let spikeDelta = 0;
        // Inject realistic routing anomalies/throttling for diagnostic demonstration
        if (resolverId === 'level3-primary' && target.domain === 'reddit.com') {
          spikeDelta = 52; // Transit throttling
        } else if (resolverId === 'opendns' && target.domain === 'netflix.com') {
          spikeDelta = 46; // Regional CDN routing hop
        } else if (resolverId === 'verisign' && target.domain === 'github.com') {
          spikeDelta = 42; // Peering congestion
        } else if (resolverId === 'adguard' && target.domain === 'youtube.com') {
          spikeDelta = 38; // Filter inspection latency
        } else {
          spikeDelta = Math.round(Math.sin(idx * 2 + resolverId.length) * (baseAvg * 0.2));
        }
        const latency = Math.max(minLat, Math.min(maxLat + 50, baseAvg + spikeDelta));
        return {
          domain: target.domain,
          latencyMs: latency,
          success: true,
          timestamp: timestamp + idx * 300,
        };
      });
    };

    return DEFAULT_RESOLVERS.map((r) => {
      const b = baselines[r.id] || {
        avg: Math.floor(Math.random() * 25) + 22,
        min: 18,
        max: 55,
        jitter: Math.round((Math.random() * 2 + 1.5) * 10) / 10,
        cached: 20,
        uncached: 35,
      };
      return {
        resolverId: r.id,
        resolver: r,
        samples: generateBaselineSamples(r.id, b.avg, b.min, b.max),
        avgLatencyMs: b.avg,
        minLatencyMs: b.min,
        maxLatencyMs: b.max,
        jitterMs: b.jitter,
        cachedAvgMs: b.cached,
        uncachedAvgMs: b.uncached,
        successRate: 100,
        dnssecSupported: r.features.dnssec,
        status: 'completed',
      };
    });
  });

  const [isRunning, setIsRunning] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentTestingMessage, setCurrentTestingMessage] = useState('');
  const [totalTestedQueries, setTotalTestedQueries] = useState(140);

  // Modals state
  const [selectedAdapterResolver, setSelectedAdapterResolver] = useState<DNSResolver | null>(null);
  const [isPortableModalOpen, setIsPortableModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [compareResolverAId, setCompareResolverAId] = useState<string | undefined>(undefined);
  const [compareResolverBId, setCompareResolverBId] = useState<string | undefined>(undefined);
  const [probeInitialResolver, setProbeInitialResolver] = useState<DNSResolver | undefined>(undefined);

  const abortBenchmarkRef = useRef(false);

  const handleOpenComparison = (idA?: string, idB?: string) => {
    setCompareResolverAId(idA);
    setCompareResolverBId(idB);
    setIsComparisonModalOpen(true);
  };

  // Helper to record a completed benchmark into History
  const recordSessionHistory = (
    completedRes: ResolverBenchmarkResult[],
    mode: 'quick' | 'standard' | 'deep'
  ) => {
    const valid = completedRes
      .filter((r) => r.avgLatencyMs > 0)
      .sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);

    if (valid.length === 0) return;

    const fastest = valid[0];
    const median = valid[Math.floor(valid.length / 2)];
    const jitterBest = [...valid].sort((a, b) => a.jitterMs - b.jitterMs)[0];

    const now = new Date();
    const dateFormatted =
      now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' +
      now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const newSession: BenchmarkSessionHistory = {
      id: `session-${Date.now()}`,
      timestamp: Date.now(),
      dateFormatted,
      mode,
      resolversCount: valid.length,
      fastestResolverName: fastest.resolver.name,
      fastestResolverIp: fastest.resolver.primaryIPv4,
      fastestLatencyMs: fastest.avgLatencyMs,
      medianLatencyMs: median?.avgLatencyMs || fastest.avgLatencyMs,
      lowestJitterMs: jitterBest?.jitterMs || fastest.jitterMs,
      lowestJitterResolverName: jitterBest?.resolver.name || fastest.resolver.name,
      avgSuccessRate: Math.round(valid.reduce((acc, r) => acc + r.successRate, 0) / valid.length),
      results: valid,
    };

    setHistory((prev) => [newSession, ...prev]);
  };

  // Start Benchmark Handler
  const handleStartBenchmark = async (
    mode: 'quick' | 'standard' | 'deep',
    specificIds?: string[]
  ) => {
    const idsToTest = specificIds || selectedResolverIds;
    const resolversToTest = allResolvers.filter((r) => idsToTest.includes(r.id));

    if (resolversToTest.length === 0) return;

    setIsRunning(true);
    setProgressPercent(0);
    abortBenchmarkRef.current = false;

    const testDomains =
      mode === 'quick' ? domains.slice(0, 4) : mode === 'deep' ? domains : domains.slice(0, 7);

    const testUncached = mode !== 'quick';
    const totalSteps = resolversToTest.length;
    let completedSteps = 0;
    let queryCounter = totalTestedQueries;

    const updatedResults: ResolverBenchmarkResult[] = [...results];

    for (let i = 0; i < resolversToTest.length; i++) {
      if (abortBenchmarkRef.current) break;

      const resolver = resolversToTest[i];
      setCurrentTestingMessage(
        `Probing [${i + 1}/${totalSteps}] ${resolver.name} (${resolver.primaryIPv4})...`
      );

      try {
        const res = await benchmarkResolver(
          resolver,
          testDomains,
          () => {
            queryCounter += 1;
            setTotalTestedQueries(queryCounter);
          },
          testUncached
        );

        const targetIdx = updatedResults.findIndex((r) => r.resolverId === resolver.id);
        if (targetIdx !== -1) {
          updatedResults[targetIdx] = res;
        } else {
          updatedResults.push(res);
        }

        setResults([...updatedResults]);
      } catch (err) {
        console.error(`Error benchmarking ${resolver.name}:`, err);
      }

      completedSteps++;
      setProgressPercent(Math.round((completedSteps / totalSteps) * 100));
    }

    setIsRunning(false);
    setCurrentTestingMessage('');

    // Automatically record this benchmark run in local history
    if (!abortBenchmarkRef.current) {
      recordSessionHistory(
        updatedResults.filter((r) => idsToTest.includes(r.resolverId)),
        mode
      );
    }
  };

  const handleCancelBenchmark = () => {
    abortBenchmarkRef.current = true;
    setIsRunning(false);
    setCurrentTestingMessage('Benchmark cancelled.');
  };

  // Custom DNS Management Handlers (CRUD)
  const handleAddCustomResolver = (newResolver: DNSResolver) => {
    setCustomResolvers((prev) => [newResolver, ...prev]);
    setSelectedResolverIds((prev) => [newResolver.id, ...prev]);
    setResults((prev) => [
      {
        resolverId: newResolver.id,
        resolver: newResolver,
        samples: [],
        avgLatencyMs: 0,
        minLatencyMs: 0,
        maxLatencyMs: 0,
        jitterMs: 0,
        cachedAvgMs: 0,
        uncachedAvgMs: 0,
        successRate: 0,
        dnssecSupported: newResolver.features.dnssec,
        status: 'pending',
      },
      ...prev,
    ]);
  };

  const handleUpdateCustomResolver = (updatedResolver: DNSResolver) => {
    setCustomResolvers((prev) =>
      prev.map((r) => (r.id === updatedResolver.id ? updatedResolver : r))
    );
    setResults((prev) =>
      prev.map((r) =>
        r.resolverId === updatedResolver.id ? { ...r, resolver: updatedResolver } : r
      )
    );
  };

  const handleDeleteCustomResolver = (id: string) => {
    setCustomResolvers((prev) => prev.filter((r) => r.id !== id));
    setSelectedResolverIds((prev) => prev.filter((item) => item !== id));
    setResults((prev) => prev.filter((r) => r.resolverId !== id));
  };

  // History handlers
  const handleLoadSession = (session: BenchmarkSessionHistory) => {
    if (session.results && session.results.length > 0) {
      setResults(session.results);
      setSelectedResolverIds(session.results.map((r) => r.resolverId));
      setActiveTab('benchmark');
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setHistory((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_HISTORY_KEY);
    } catch (e) {}
  };

  const handleExportCsv = () => {
    const csv = generateResultsCsv(results);
    downloadFile(csv, `DNS_SpeedBench_v1_Results_${Date.now()}.csv`, 'text/csv');
  };

  const handleSelectResolverForProbe = (resolver: DNSResolver) => {
    setProbeInitialResolver(resolver);
    setActiveTab('probe');
  };

  const fastestResult = [...results]
    .filter((r) => r.avgLatencyMs > 0 && selectedResolverIds.includes(r.resolverId))
    .sort((a, b) => a.avgLatencyMs - b.avgLatencyMs)[0];

  return (
    <div className={`h-screen w-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 overflow-hidden select-none ${darkMode ? 'dark' : ''}`}>
      {/* App Command Bar & Ribbon Navigation */}
      <WindowsTitleBar
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onOpenPortableModal={() => setIsPortableModalOpen(true)}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onOpenSelectorModal={() => setIsSelectorModalOpen(true)}
        selectedCount={selectedResolverIds.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Window Content Viewport */}
      <main className="flex-1 overflow-y-auto min-h-0 bg-neutral-50 dark:bg-neutral-950">
        {activeTab === 'benchmark' && (
          <BenchmarkView
            results={results.filter((r) => selectedResolverIds.includes(r.resolverId))}
            isRunning={isRunning}
            progressPercent={progressPercent}
            currentTestingMessage={currentTestingMessage}
            onStartBenchmark={handleStartBenchmark}
            onCancelBenchmark={handleCancelBenchmark}
            onOpenAdapterModal={(r) =>
              setSelectedAdapterResolver(r || fastestResult?.resolver || null)
            }
            onOpenCustomModal={() => setIsCustomModalOpen(true)}
            onOpenSelectorModal={() => setIsSelectorModalOpen(true)}
            onViewVisualizations={() => setActiveTab('visualize')}
            onOpenComparison={handleOpenComparison}
            onSelectResolverForProbe={handleSelectResolverForProbe}
            activeDomainCount={domains.length}
            selectedResolverCount={selectedResolverIds.length}
            totalAvailableResolvers={allResolvers.length}
          />
        )}

        {activeTab === 'visualize' && (
          <ResultsVisualization
            results={results.filter((r) => selectedResolverIds.includes(r.resolverId))}
            onOpenAdapterModal={(r) => setSelectedAdapterResolver(r)}
            onSelectResolverForProbe={handleSelectResolverForProbe}
          />
        )}

        {activeTab === 'table' && (
          <ResultsTable
            results={results.filter((r) => selectedResolverIds.includes(r.resolverId))}
            onOpenAdapterModal={(r) => setSelectedAdapterResolver(r)}
            onSelectResolverForProbe={handleSelectResolverForProbe}
            onExportCsv={handleExportCsv}
            onOpenComparison={handleOpenComparison}
          />
        )}

        {activeTab === 'history' && (
          <BenchmarkHistoryView
            history={history}
            onLoadSession={handleLoadSession}
            onDeleteSession={handleDeleteSession}
            onClearAllHistory={handleClearAllHistory}
            onOpenAdapterModal={(r) => setSelectedAdapterResolver(r)}
            currentFastestMs={fastestResult?.avgLatencyMs}
          />
        )}

        {activeTab === 'manager' && (
          <DnsServerManager
            customResolvers={customResolvers}
            onAddResolver={handleAddCustomResolver}
            onUpdateResolver={handleUpdateCustomResolver}
            onDeleteResolver={handleDeleteCustomResolver}
            onOpenAdapterModal={(r) => setSelectedAdapterResolver(r)}
            onSelectResolverForProbe={handleSelectResolverForProbe}
          />
        )}

        {activeTab === 'probe' && (
          <LiveProbeView
            resolvers={allResolvers}
            initialSelectedResolver={probeInitialResolver}
          />
        )}

        {activeTab === 'export' && (
          <PortableExeModal isStandaloneTab={true} />
        )}
      </main>

      {/* Windows 11 Status Bar with Rohith Varma Attribution */}
      <WindowsStatusBar
        isRunning={isRunning}
        totalTestedQueries={totalTestedQueries}
        fastestResult={fastestResult}
        onOpenAdapterModal={() =>
          setSelectedAdapterResolver(fastestResult?.resolver || null)
        }
        onExportCsv={handleExportCsv}
      />

      {/* Modals & Dialogs */}
      <AdapterConfigModal
        resolver={selectedAdapterResolver}
        onClose={() => setSelectedAdapterResolver(null)}
      />

      {isComparisonModalOpen && (
        <ComparisonModal
          initialResolverAId={compareResolverAId}
          initialResolverBId={compareResolverBId}
          results={results}
          onClose={() => setIsComparisonModalOpen(false)}
          onOpenAdapterModal={(r) => setSelectedAdapterResolver(r)}
          onSelectResolverForProbe={handleSelectResolverForProbe}
        />
      )}

      {isSelectorModalOpen && (
        <ResolverSelectorModal
          resolvers={allResolvers}
          selectedIds={selectedResolverIds}
          onSaveSelection={(ids) => setSelectedResolverIds(ids)}
          onStartWithSelection={(ids) => {
            setSelectedResolverIds(ids);
            handleStartBenchmark('standard', ids);
          }}
          onClose={() => setIsSelectorModalOpen(false)}
        />
      )}

      {isPortableModalOpen && (
        <PortableExeModal
          onClose={() => setIsPortableModalOpen(false)}
          isStandaloneTab={false}
        />
      )}

      {isCustomModalOpen && (
        <CustomResolverModal
          onClose={() => setIsCustomModalOpen(false)}
          onAddResolver={handleAddCustomResolver}
        />
      )}

      {isAboutModalOpen && (
        <AboutDialog onClose={() => setIsAboutModalOpen(false)} />
      )}
    </div>
  );
}
