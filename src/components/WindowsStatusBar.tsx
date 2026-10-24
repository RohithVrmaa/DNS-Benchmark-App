import React from 'react';
import { Wifi, CheckCircle2, Clock, Cpu, HardDrive, FileSpreadsheet } from 'lucide-react';
import { ResolverBenchmarkResult } from '../types/dns';

interface WindowsStatusBarProps {
  isRunning: boolean;
  totalTestedQueries: number;
  fastestResult?: ResolverBenchmarkResult;
  onOpenAdapterModal: () => void;
  onExportCsv: () => void;
}

export const WindowsStatusBar: React.FC<WindowsStatusBarProps> = ({
  isRunning,
  totalTestedQueries,
  fastestResult,
  onOpenAdapterModal,
  onExportCsv,
}) => {
  return (
    <footer className="flex items-center justify-between h-7 px-3 text-[11px] select-none border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
      {/* Left: Adapter and Network Details */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-medium text-neutral-800 dark:text-neutral-200">
          <Wifi className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Adapter: Wi-Fi (802.11ax)</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
          <span>Gateway: 192.168.1.1</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{isRunning ? 'Running Live Benchmark...' : 'DNS Engine Idle'}</span>
        </div>
      </div>

      {/* Center: Query Count & Standalone Spec */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-neutral-400" />
          <span>Queries Probed:</span>
          <span className="font-mono tabular-nums font-semibold text-neutral-800 dark:text-neutral-200">
            {totalTestedQueries}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-neutral-400" />
          <span>Exe Footprint:</span>
          <span className="font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
            2.4 MB RAM
          </span>
        </div>

        <div className="flex items-center gap-1">
          <HardDrive className="w-3 h-3 text-neutral-400" />
          <span>DNS SpeedBench v1.0 · Rohith Varma</span>
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-2">
        {fastestResult && (
          <button
            onClick={onOpenAdapterModal}
            className="flex items-center gap-1 px-2 py-0.5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded transition-colors font-medium"
            title="Configure Windows adapter with fastest DNS"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Apply</span>
            <span>{fastestResult.resolver.name} ({fastestResult.avgLatencyMs}ms)</span>
          </button>
        )}

        <button
          onClick={onExportCsv}
          className="flex items-center gap-1 px-1.5 py-0.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 rounded transition-colors"
          title="Export CSV Benchmark Report"
        >
          <FileSpreadsheet className="w-3 h-3" />
          <span className="hidden sm:inline">CSV</span>
        </button>
      </div>
    </footer>
  );
};
