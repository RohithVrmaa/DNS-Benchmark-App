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
} from 'lucide-react';
import {
  generatePortableBatchBenchmark,
  generateCSharpStandaloneSource,
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
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const csharpCode = generateCSharpStandaloneSource();
  const compileCmd = `C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe /out:DNSBenchmark.exe /target:exe DNSBenchmark.cs && .\\DNSBenchmark.exe`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadBatch = () => {
    const script = generatePortableBatchBenchmark();
    downloadFile(script, 'DNS_SpeedBench_Portable.bat', 'text/plain');
  };

  const handleDownloadCSharp = () => {
    downloadFile(csharpCode, 'DNSBenchmark.cs', 'text/plain');
  };

  const handleDownloadCompileScript = () => {
    const buildBat = `@echo off
echo ===================================================
echo Compiling DNSBenchmark.exe (Zero-Install Standalone)
echo ===================================================
echo.
C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe /out:DNSBenchmark.exe /target:exe DNSBenchmark.cs
if %errorlevel% equ 0 (
    echo.
    echo Compilation Successful! Launching DNSBenchmark.exe...
    echo.
    DNSBenchmark.exe
) else (
    echo Compilation failed. Ensure DNSBenchmark.cs is in this folder.
    pause
)
`;
    downloadFile(buildBat, 'Compile_and_Run_Exe.bat', 'text/plain');
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
            : 'relative w-full max-w-3xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]'
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <HardDriveDownload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  DNS SpeedBench v1.0 Portable Executable (.exe)
                </h2>
                <span className="text-xs text-neutral-500 font-medium">by Rohith Varma</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Zero-install architecture — runs directly in memory with no registry modification or setup wizard.
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
          {/* Key Advantages Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-neutral-900 dark:text-white">
                  Zero Installation
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  No MSI or setup.exe installer. Simply run directly from any folder or USB stick.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 flex items-start gap-2.5">
              <Cpu className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-neutral-900 dark:text-white">
                  Direct Memory Execution
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Ultra-light memory footprint (~2MB RAM) with microsecond timer precision.
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
                  No leftover files in AppData, no background services, no telemetry daemons.
                </div>
              </div>
            </div>
          </div>

          {/* Download Option 1: Standalone Batch Executable (Double Click & Run) */}
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-blue-950 dark:text-blue-200 text-sm flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Download Portable Standalone Runner (`DNS_SpeedBench_Portable.bat`)</span>
                </span>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Single standalone file that runs instantly in Windows Command Prompt on any Windows 10/11 system.
                </p>
              </div>

              <button
                onClick={handleDownloadBatch}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .bat Runner</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900 text-neutral-300 font-mono text-[11px]">
              # How to run: Double-click DNS_SpeedBench_Portable.bat in Downloads or USB drive
            </div>
          </div>

          {/* Download Option 2: Native Single .exe Compilation in 1-Click */}
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <span>Build Native Standalone `DNSBenchmark.exe` (Zero Third-Party Tools)</span>
                </span>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Uses the built-in Microsoft C# compiler (`csc.exe`) pre-installed in every Windows operating system.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCSharp}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors border border-neutral-300 dark:border-neutral-600"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Source (.cs)</span>
                </button>
                <button
                  onClick={handleDownloadCompileScript}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Build Exe Script</span>
                </button>
              </div>
            </div>

            {/* Quick 1-Line Command Box */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span>Or run this single command in Command Prompt to generate .exe:</span>
                <button
                  onClick={() => handleCopy(compileCmd, 'compile')}
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
                {compileCmd}
              </div>
            </div>
          </div>

          {/* Portable USB Flash Drive Deployment Guide */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/80 flex flex-col gap-2">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Portable USB Drive Deployment Checklist:
            </span>
            <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400 text-[11px] leading-relaxed">
              <li>Place <code className="text-neutral-900 dark:text-neutral-200 font-mono">DNSBenchmark.exe</code> directly on your USB flash drive or external SSD.</li>
              <li>Plug into any Windows 10, Windows 11, or Windows Server machine.</li>
              <li>Double-click to benchmark the local network connection in under 5 seconds.</li>
              <li>Apply the fastest DNS without installing network management suites or bulky software.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
