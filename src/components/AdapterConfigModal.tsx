import React, { useState } from 'react';
import {
  X,
  Check,
  Copy,
  Terminal,
  Download,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  Laptop,
  CheckCircle2,
} from 'lucide-react';
import { DNSResolver } from '../types/dns';
import {
  generatePowerShellApplyScript,
  generateBatchApplyScript,
  generateRegistryScript,
  downloadFile,
} from '../services/windowsScriptGenerator';

interface AdapterConfigModalProps {
  resolver: DNSResolver | null;
  onClose: () => void;
}

export const AdapterConfigModal: React.FC<AdapterConfigModalProps> = ({ resolver, onClose }) => {
  if (!resolver) return null;

  const [adapterName, setAdapterName] = useState('Wi-Fi');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const psScript = generatePowerShellApplyScript(resolver, adapterName);
  const psOneLiner = `Set-DnsClientServerAddress -InterfaceAlias "${adapterName}" -ServerAddresses ("${resolver.primaryIPv4}"${
    resolver.secondaryIPv4 ? `,"${resolver.secondaryIPv4}"` : ''
  }); Clear-DnsClientCache; ipconfig /flushdns`;

  const cmdNetsh = `netsh interface ipv4 set dnsservers name="${adapterName}" static ${resolver.primaryIPv4} primary${
    resolver.secondaryIPv4
      ? ` && netsh interface ipv4 add dnsservers name="${adapterName}" ${resolver.secondaryIPv4} index=2`
      : ''
  } && ipconfig /flushdns`;

  const resetDhcpCmd = `Set-DnsClientServerAddress -InterfaceAlias "${adapterName}" -ResetServerAddresses; Clear-DnsClientCache`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadBatch = () => {
    const script = generateBatchApplyScript(resolver, adapterName);
    downloadFile(script, `Apply_${resolver.name.replace(/\s+/g, '_')}_DNS.bat`, 'text/plain');
  };

  const handleDownloadReg = () => {
    const script = generateRegistryScript(resolver);
    downloadFile(script, `DNS_${resolver.name.replace(/\s+/g, '_')}.reg`, 'text/plain');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Title Bar (Windows 11 Dialog Style) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Apply DNS to Windows Network Adapter
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Configure {resolver.name} directly on your physical network card
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Target Resolver Summary Card */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: resolver.color }}
              />
              <div>
                <div className="font-bold text-neutral-900 dark:text-white text-sm">
                  {resolver.name}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {resolver.location}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 font-mono text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase">Primary DNS</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {resolver.primaryIPv4}
                </span>
              </div>
              {resolver.secondaryIPv4 && (
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase">Secondary DNS</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {resolver.secondaryIPv4}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Adapter Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-800 dark:text-neutral-200">
              Select Active Windows Network Adapter:
            </label>
            <div className="flex items-center gap-2">
              {(['Wi-Fi', 'Ethernet', 'vEthernet (Default Switch)'].map((name) => (
                <button
                  key={name}
                  onClick={() => setAdapterName(name)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    adapterName === name
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                  }`}
                >
                  {name}
                </button>
              )))}
            </div>
          </div>

          {/* Option 1: 1-Click PowerShell Command (Recommended) */}
          <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Option A: PowerShell One-Liner (Instant & Admin Verified)</span>
              </span>
              <button
                onClick={() => handleCopy(psOneLiner, 'powershell')}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-2xs"
              >
                {copiedType === 'powershell' ? (
                  <>
                    <Check className="w-3 h-3" />
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
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
              Press <kbd className="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-800 rounded font-mono text-[10px]">Win + X</kbd> → select <strong>Terminal (Admin)</strong> or PowerShell, then paste and hit Enter:
            </p>
            <div className="p-2.5 rounded-lg bg-neutral-900 text-neutral-200 font-mono text-[11px] overflow-x-auto select-all border border-neutral-800">
              {psOneLiner}
            </div>
          </div>

          {/* Option 2: Download Ready-to-Run Batch Script */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <div>
              <div className="font-bold text-neutral-900 dark:text-white">
                Option B: Download Executable Batch File (.bat)
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Double-click to automatically apply this DNS configuration with elevation prompt.
              </p>
            </div>
            <button
              onClick={handleDownloadBatch}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-lg transition-colors border border-neutral-300 dark:border-neutral-600 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .bat</span>
            </button>
          </div>

          {/* Option 3: Command Prompt netsh */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/80 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Option C: Windows CMD (netsh) Command
              </span>
              <button
                onClick={() => handleCopy(cmdNetsh, 'cmd')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] flex items-center gap-1"
              >
                {copiedType === 'cmd' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'cmd' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-2 rounded bg-neutral-900 text-neutral-300 font-mono text-[10px] overflow-x-auto select-all">
              {cmdNetsh}
            </pre>
          </div>

          {/* Revert to Default DHCP */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-neutral-500">
            <div className="text-[11px]">
              Need to restore automatic ISP DNS later?
            </div>
            <button
              onClick={() => handleCopy(resetDhcpCmd, 'reset')}
              className="flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{copiedType === 'reset' ? 'Reset Command Copied!' : 'Copy DHCP Reset Command'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
