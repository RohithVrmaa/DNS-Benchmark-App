import React, { useState } from 'react';
import {
  Minus,
  Square,
  X,
  Copy,
  Zap,
  Moon,
  Sun,
  Laptop,
  Maximize2,
  HardDriveDownload,
  ShieldCheck,
  History,
  Info,
  User,
} from 'lucide-react';

interface WindowsTitleBarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  isFullscreenWindow: boolean;
  onToggleFullscreen: () => void;
  onOpenPortableModal: () => void;
  onOpenAboutModal: () => void;
  activeTab: 'benchmark' | 'visualize' | 'table' | 'history' | 'manager' | 'probe' | 'export';
  setActiveTab: (tab: 'benchmark' | 'visualize' | 'table' | 'history' | 'manager' | 'probe' | 'export') => void;
  onOpenSelectorModal?: () => void;
  selectedCount?: number;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  darkMode,
  onToggleTheme,
  isFullscreenWindow,
  onToggleFullscreen,
  onOpenPortableModal,
  onOpenAboutModal,
  activeTab,
  setActiveTab,
  onOpenSelectorModal,
  selectedCount = 52,
}) => {
  const [showSnapGrid, setShowSnapGrid] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <header className="relative flex flex-col select-none border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/95 dark:bg-neutral-900/95 backdrop-blur-md transition-colors">
      {/* Top Window Chrome (Windows 11 Caption Bar) */}
      <div className="flex items-center justify-between h-9 px-3 text-xs">
        {/* Left: App Identity & Developer Credit */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-600 text-white shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              DNS SpeedBench
            </span>
            <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 font-semibold">
              v1.0
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-200/60 dark:bg-neutral-800 px-2 py-0.5 rounded">
              by <strong>Rohith Varma</strong>
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Portable Standalone (.exe)
            </span>
          </div>
        </div>

        {/* Center: Window Subtitle Drag Surface */}
        <div className="hidden md:flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-[11px]">
          <span>Top 50 Anycast Benchmarker & Windows Network Configurator</span>
        </div>

        {/* Right: Windows 11 Window Controls */}
        <div className="flex items-center">
          {/* About Dialog Button */}
          <button
            onClick={onOpenAboutModal}
            title="About DNS SpeedBench v1.0 by Rohith Varma"
            className="flex items-center gap-1 px-2 py-1 mr-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/70 dark:hover:bg-neutral-800 rounded transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">About</span>
          </button>

          {/* Quick Theme Switch */}
          <button
            onClick={onToggleTheme}
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="flex items-center justify-center w-8 h-8 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors mr-1"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Portable Exe Export Quick Button */}
          <button
            onClick={onOpenPortableModal}
            className="flex items-center gap-1.5 px-2.5 py-1 mr-2 text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded border border-blue-200 dark:border-blue-800 transition-colors"
          >
            <HardDriveDownload className="w-3 h-3" />
            <span className="hidden sm:inline">Get Portable .exe</span>
          </button>

          {/* Minimize Button */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center justify-center w-10 h-8 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Snap Button */}
          <div
            className="relative"
            onMouseEnter={() => setShowSnapGrid(true)}
            onMouseLeave={() => setShowSnapGrid(false)}
          >
            <button
              onClick={onToggleFullscreen}
              className="flex items-center justify-center w-10 h-8 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors"
              title={isFullscreenWindow ? 'Restore Down' : 'Maximize'}
            >
              {isFullscreenWindow ? (
                <Copy className="w-3.5 h-3.5" />
              ) : (
                <Square className="w-3 h-3" />
              )}
            </button>

            {/* Windows 11 Snap Layout Tooltip Preview */}
            {showSnapGrid && (
              <div className="absolute right-0 top-8 z-50 p-2 bg-neutral-900/95 text-white rounded-lg shadow-xl border border-neutral-700 text-[10px] w-48 pointer-events-none backdrop-blur-md">
                <div className="text-neutral-400 mb-1.5 font-medium">Windows 11 Snap Layouts</div>
                <div className="grid grid-cols-2 gap-1 h-14">
                  <div className="border border-blue-500/60 bg-blue-500/20 rounded flex items-center justify-center">
                    Left 50%
                  </div>
                  <div className="border border-neutral-700 hover:border-neutral-500 rounded flex items-center justify-center">
                    Right 50%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              if (window.confirm('Close DNS SpeedBench Portable?')) {
                window.location.reload();
              }
            }}
            className="flex items-center justify-center w-11 h-8 text-neutral-600 dark:text-neutral-400 hover:bg-red-600 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ribbon Navigation Bar */}
      <div className="flex items-center justify-between px-3 h-10 border-t border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-950/50 overflow-x-auto">
        <nav className="flex items-center gap-1 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
              activeTab === 'benchmark'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
            }`}
          >
            Benchmark
          </button>

          <button
            onClick={() => setActiveTab('visualize')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
              activeTab === 'visualize'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
            }`}
          >
            Visual Charts
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
              activeTab === 'table'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
            }`}
          >
            Detailed Metrics
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5 text-blue-500" />
            <span>Benchmark History</span>
          </button>

          <button
            onClick={() => setActiveTab('manager')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
              activeTab === 'manager'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
            }`}
          >
            DNS Server Manager
          </button>

          <button
            onClick={() => setActiveTab('probe')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
              activeTab === 'probe'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
            }`}
          >
            Live Probe
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
              activeTab === 'export'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
            }`}
          >
            Portable .exe
          </button>
        </nav>

        {/* Right side: Select Resolvers button & indicator */}
        <div className="flex items-center gap-2 shrink-0 pl-3">
          {onOpenSelectorModal && (
            <button
              onClick={onOpenSelectorModal}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md border border-blue-200 dark:border-blue-800 transition-colors"
            >
              <span>Select Resolvers</span>
              <span className="font-mono text-[11px] bg-blue-200/70 dark:bg-blue-800/80 px-1.5 py-0.2 rounded">
                {selectedCount}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
