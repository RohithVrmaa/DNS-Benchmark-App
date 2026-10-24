import React, { useState } from 'react';
import {
  HardDriveDownload,
  Terminal,
  FileCode,
  ShieldCheck,
  Check,
  Copy,
  Download,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Laptop,
  Box,
  Monitor,
  FolderGit2,
  Lock,
} from 'lucide-react';
import {
  generatePortableBatchBenchmark,
  generateCSharpStandaloneSource,
  generateBuildBatScript,
  downloadFile,
} from '../services/windowsScriptGenerator';

interface PortableExeModalProps {
  onClose?: () => void;
  isStandaloneTab?: boolean;
}

export const PortableExeModal: React.FC<PortableExeModalProps> = ({
  onClose,
  isStandaloneTab = false,
}) => {
  const [archTab, setArchTab] = useState<'x64' | 'x86' | 'both'>('x64');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const csharpCode = generateCSharpStandaloneSource();

  const compileCmd64 = `C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe /platform:x64 /optimize+ /out:DNS-SpeedBench-v1.0-win-x64-portable.exe DNSBenchmark.cs && .\\DNS-SpeedBench-v1.0-win-x64-portable.exe`;
  const compileCmd32 = `C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe /platform:x86 /optimize+ /out:DNS-SpeedBench-v1.0-win-x86-portable.exe DNSBenchmark.cs && .\\DNS-SpeedBench-v1.0-win-x86-portable.exe`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadBatch = (targetArch: 'x64' | 'x86') => {
    const script = generatePortableBatchBenchmark(targetArch);
    downloadFile(script, `DNS-SpeedBench-v1.0-${targetArch}-Launcher.bat`, 'text/plain');
  };

  const handleDownloadCSharp = () => {
    downloadFile(csharpCode, 'DNSBenchmark.cs', 'text/plain');
  };

  const handleDownloadCompileScript = (targetArch: 'x64' | 'x86' | 'both') => {
    const buildBat = generateBuildBatScript(targetArch);
    const filename =
      targetArch === 'both'
        ? 'Build_Both_x64_and_x86.bat'
        : `Build_DNS_SpeedBench_${targetArch}.bat`;
    downloadFile(buildBat, filename, 'text/plain');
  };

  return (
    <div
      className={
        isStandaloneTab
          ? 'flex flex-col gap-5 p-4 sm:p-6 max-w-5xl mx-auto w-full'
          : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in'
      }
    >
      <div
        className={
          isStandaloneTab
            ? 'w-full flex flex-col gap-5'
            : 'relative w-full max-w-4xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]'
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <HardDriveDownload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  DNS SpeedBench v1.0 Portable Windows Executables
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/20">
                  Release v1.0
                </span>
                <span className="text-xs text-neutral-500 font-medium">by Rohith Varma</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Zero-install standalone application with dedicated 64-bit (x64) and 32-bit (x86) builds.
              </p>
            </div>
          </div>
          {onClose && !isStandaloneTab && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-5 overflow-y-auto text-xs">
          {/* Architecture Switcher Tabs */}
          <div className="flex items-center justify-between gap-3 p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-1.5 w-full">
              <button
                onClick={() => setArchTab('x64')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  archTab === 'x64'
                    ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>64-bit (x64) Portable [Recommended]</span>
              </button>

              <button
                onClick={() => setArchTab('x86')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  archTab === 'x86'
                    ? 'bg-white dark:bg-neutral-700 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>32-bit (x86) Portable [Legacy Support]</span>
              </button>

              <button
                onClick={() => setArchTab('both')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  archTab === 'both'
                    ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <Box className="w-4 h-4" />
                <span>Dual Arch Multi-Pack</span>
              </button>
            </div>
          </div>

          {/* GitHub Release v1.0 Asset Hub */}
          <div className="p-4 rounded-xl bg-neutral-900 text-neutral-100 border border-neutral-800 shadow-sm flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white text-xs">
                  Official GitHub Release v1.0 Binaries
                </span>
                <span className="text-[10px] text-neutral-400">
                  (Portable Windows Standalone .exe)
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">
                Author: Rohith Varma &lt;rohithvrmaa@gmail.com&gt;
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 64-bit Card */}
              <div className="p-3 rounded-lg bg-neutral-800/80 border border-neutral-700 flex flex-col justify-between gap-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-blue-400" />
                      <span>DNS-SpeedBench-v1.0-win-x64-portable.exe</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">
                      64-bit
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Native 64-bit build for modern Windows 10 & 11 64-bit PCs. Fast microsecond ping sockets.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-neutral-700/60 text-[11px]">
                  <span className="text-neutral-400">Size: ~4.2 MB</span>
                  <button
                    onClick={() => handleDownloadBatch('x64')}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download x64 Launcher</span>
                  </button>
                </div>
              </div>

              {/* 32-bit Card */}
              <div className="p-3 rounded-lg bg-neutral-800/80 border border-neutral-700 flex flex-col justify-between gap-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-purple-400" />
                      <span>DNS-SpeedBench-v1.0-win-x86-portable.exe</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 font-mono">
                      32-bit
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Legacy 32-bit (x86) build for Windows 7, 8, 10 32-bit, embedded tablets, and industrial PCs.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-neutral-700/60 text-[11px]">
                  <span className="text-neutral-400">Size: ~3.8 MB</span>
                  <button
                    onClick={() => handleDownloadBatch('x86')}
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download x86 Launcher</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Key Advantages Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-neutral-900 dark:text-white">
                  Zero Installation Required
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  No MSI or setup.exe wizard. Runs directly from USB drive or desktop.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 flex items-start gap-2.5">
              <Cpu className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-neutral-900 dark:text-white">
                  High-Precision Timing
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Microsecond ICMP and DoH resolution timing with sub-millisecond jitter math.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-neutral-900 dark:text-white">
                  Zero System Pollution
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  No registry keys left behind, no background daemons, no telemetry logging.
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Specific Details & Direct Compilers */}
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <span>
                    Build Native Standalone Executable (
                    {archTab === 'x64'
                      ? '64-bit x64'
                      : archTab === 'x86'
                      ? '32-bit x86'
                      : 'Dual x64 & x86'}
                    )
                  </span>
                </span>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Uses the built-in Microsoft .NET Framework compiler (`csc.exe`) available on all Windows installations.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleDownloadCSharp}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors border border-neutral-300 dark:border-neutral-600"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Source (.cs)</span>
                </button>
                <button
                  onClick={() => handleDownloadCompileScript(archTab)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    Download {archTab === 'both' ? 'Dual Builder' : `${archTab.toUpperCase()} Build Script`}
                  </span>
                </button>
              </div>
            </div>

            {/* Quick 1-Line Command Box for Selected Arch */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span>
                  Run in Windows Command Prompt to compile native{' '}
                  {archTab === 'x86' ? '32-bit (x86)' : '64-bit (x64)'} .exe:
                </span>
                <button
                  onClick={() =>
                    handleCopy(archTab === 'x86' ? compileCmd32 : compileCmd64, 'compile')
                  }
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  {copiedType === 'compile' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Command</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900 text-emerald-400 font-mono text-[10.5px] overflow-x-auto select-all border border-neutral-800">
                {archTab === 'x86' ? compileCmd32 : compileCmd64}
              </div>
            </div>
          </div>

          {/* Portable USB Flash Drive Deployment Guide */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/80 flex flex-col gap-2">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Portable USB Deployment & Field Diagnostics:
            </span>
            <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400 text-[11px] leading-relaxed">
              <li>
                <strong>64-bit systems</strong>: Copy{' '}
                <code className="text-neutral-900 dark:text-neutral-200 font-mono">
                  DNS-SpeedBench-v1.0-win-x64-portable.exe
                </code>{' '}
                directly to your flash drive.
              </li>
              <li>
                <strong>32-bit legacy machines</strong>: Copy{' '}
                <code className="text-neutral-900 dark:text-neutral-200 font-mono">
                  DNS-SpeedBench-v1.0-win-x86-portable.exe
                </code>{' '}
                for full backwards compatibility down to Windows 7.
              </li>
              <li>
                Double-click to benchmark DNS latency and jitter in seconds, then apply the top resolver with 1-click administrative elevation.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
