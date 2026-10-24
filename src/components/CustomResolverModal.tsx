import React, { useState } from 'react';
import { X, Plus, Server, Check } from 'lucide-react';
import { DNSResolver } from '../types/dns';

interface CustomResolverModalProps {
  onClose: () => void;
  onAddResolver: (resolver: DNSResolver) => void;
}

export const CustomResolverModal: React.FC<CustomResolverModalProps> = ({
  onClose,
  onAddResolver,
}) => {
  const [name, setName] = useState('');
  const [primaryIPv4, setPrimaryIPv4] = useState('');
  const [secondaryIPv4, setSecondaryIPv4] = useState('');
  const [dohEndpoint, setDohEndpoint] = useState('');
  const [provider, setProvider] = useState('Custom / Local');
  const [dnssec, setDnssec] = useState(false);
  const [malwareBlocking, setMalwareBlocking] = useState(false);
  const [adBlocking, setAdBlocking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !primaryIPv4.trim()) return;

    const newResolver: DNSResolver = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      tagline: `${primaryIPv4} - Custom User Configured Resolver`,
      provider: provider.trim() || 'Custom Network',
      primaryIPv4: primaryIPv4.trim(),
      secondaryIPv4: secondaryIPv4.trim() || '',
      dohEndpoint: dohEndpoint.trim() || 'https://cloudflare-dns.com/dns-query',
      dohMethod: 'GET',
      location: 'Custom Local / Anycast',
      features: {
        dnssec,
        malwareBlocking,
        adBlocking,
        noLogging: true,
        anycast: false,
      },
      color: '#8B5CF6',
      isCustom: true,
    };

    onAddResolver(newResolver);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Add Custom DNS Resolver
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Test your Pi-hole, router gateway, or private corporate DNS server
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5 text-xs">
          <div>
            <label className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
              Resolver Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Home Pi-hole, Office Gateway, Quad10..."
              className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
                Primary IPv4 Address *
              </label>
              <input
                type="text"
                required
                value={primaryIPv4}
                onChange={(e) => setPrimaryIPv4(e.target.value)}
                placeholder="e.g. 192.168.1.1"
                className="w-full px-3 py-2 font-mono rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
                Secondary IPv4 (Optional)
              </label>
              <input
                type="text"
                value={secondaryIPv4}
                onChange={(e) => setSecondaryIPv4(e.target.value)}
                placeholder="e.g. 192.168.1.2"
                className="w-full px-3 py-2 font-mono rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
              DoH Endpoint (DNS-over-HTTPS URL)
            </label>
            <input
              type="text"
              value={dohEndpoint}
              onChange={(e) => setDohEndpoint(e.target.value)}
              placeholder="https://your-pihole.local/dns-query"
              className="w-full px-3 py-2 font-mono text-[11px] rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              Used for live in-browser queries. Leave blank to benchmark via standard fallback.
            </span>
          </div>

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Resolver Features:
            </span>
            <div className="flex items-center gap-4 text-[11px]">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dnssec}
                  onChange={(e) => setDnssec(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>DNSSEC Validating</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adBlocking}
                  onChange={(e) => setAdBlocking(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Ad-Blocking (Pi-hole / Sinkhole)</span>
              </label>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Benchmark</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
