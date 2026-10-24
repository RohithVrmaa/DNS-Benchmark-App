import React from 'react';
import { X, ShieldCheck, Zap, User, Code, Heart, Laptop, HardDrive } from 'lucide-react';

interface AboutDialogProps {
  onClose: () => void;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-blue-600 text-white shadow-xs">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                DNS SpeedBench v1.0
              </h2>
              <p className="text-[11px] text-neutral-500">
                Standalone Portable Edition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              RV
            </div>
            <div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                Author & Developer
              </div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white">
                Rohith Varma
              </div>
              <div className="text-[11px] text-neutral-500">
                Lead Software Engineer
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-neutral-600 dark:text-neutral-300 leading-relaxed text-[11.5px]">
            <p>
              <strong>DNS SpeedBench v1.0</strong> is a high-performance Windows desktop benchmarking utility designed to probe, compare, and configure DNS Anycast resolvers with microsecond accuracy.
            </p>
            <p>
              Built strictly as a <strong>zero-installation portable application</strong>: no registry pollution, no background services, and zero network bloat.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 flex flex-col gap-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-neutral-400 font-sans">Version:</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">1.0.0 (Release)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 font-sans">Architecture:</span>
              <span className="text-neutral-700 dark:text-neutral-300">Portable .exe / Standalone</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 font-sans">Platform Target:</span>
              <span className="text-neutral-700 dark:text-neutral-300">Windows 11 / 10 Fluent</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 font-sans">Storage Engine:</span>
              <span className="text-neutral-700 dark:text-neutral-300">Client-Side Local Storage</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70 flex items-center justify-between text-neutral-500 text-[11px]">
          <span>© 2026 Rohith Varma</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
