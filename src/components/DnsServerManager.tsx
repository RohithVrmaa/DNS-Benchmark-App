import React, { useState } from 'react';
import {
  Server,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Laptop,
  Zap,
  Shield,
  ShieldCheck,
  AlertCircle,
  Copy,
  FolderOpen,
} from 'lucide-react';
import { DNSResolver } from '../types/dns';

interface DnsServerManagerProps {
  customResolvers: DNSResolver[];
  onAddResolver: (resolver: DNSResolver) => void;
  onUpdateResolver: (resolver: DNSResolver) => void;
  onDeleteResolver: (id: string) => void;
  onOpenAdapterModal: (resolver: DNSResolver) => void;
  onSelectResolverForProbe: (resolver: DNSResolver) => void;
}

export const DnsServerManager: React.FC<DnsServerManagerProps> = ({
  customResolvers,
  onAddResolver,
  onUpdateResolver,
  onDeleteResolver,
  onOpenAdapterModal,
  onSelectResolverForProbe,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formProvider, setFormProvider] = useState('');
  const [formPrimaryIp, setFormPrimaryIp] = useState('');
  const [formSecondaryIp, setFormSecondaryIp] = useState('');
  const [formDoh, setFormDoh] = useState('');
  const [formLocation, setFormLocation] = useState('Local Network / Custom');
  const [formDnssec, setFormDnssec] = useState(false);
  const [formMalware, setFormMalware] = useState(false);
  const [formAdBlock, setFormAdBlock] = useState(true);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const resetForm = () => {
    setFormName('');
    setFormProvider('');
    setFormPrimaryIp('');
    setFormSecondaryIp('');
    setFormDoh('');
    setFormLocation('Local Network / Custom');
    setFormDnssec(false);
    setFormMalware(false);
    setFormAdBlock(true);
    setFormNotes('');
    setFormError('');
    setIsCreating(false);
    setEditingId(null);
  };

  const handleStartEdit = (resolver: DNSResolver) => {
    setEditingId(resolver.id);
    setIsCreating(false);
    setFormName(resolver.name);
    setFormProvider(resolver.provider);
    setFormPrimaryIp(resolver.primaryIPv4);
    setFormSecondaryIp(resolver.secondaryIPv4 || '');
    setFormDoh(resolver.dohEndpoint || '');
    setFormLocation(resolver.location || 'Local Network / Custom');
    setFormDnssec(resolver.features.dnssec);
    setFormMalware(resolver.features.malwareBlocking);
    setFormAdBlock(resolver.features.adBlocking);
    setFormNotes(resolver.notes || '');
    setFormError('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Please enter a resolver name');
      return;
    }
    if (!formPrimaryIp.trim()) {
      setFormError('Please enter a primary IPv4 address');
      return;
    }

    // Basic IPv4 validation
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(formPrimaryIp.trim())) {
      setFormError('Primary IP must be a valid IPv4 address (e.g. 192.168.1.1)');
      return;
    }
    if (formSecondaryIp.trim() && !ipPattern.test(formSecondaryIp.trim())) {
      setFormError('Secondary IP must be a valid IPv4 address');
      return;
    }

    const payload: DNSResolver = {
      id: editingId || `custom-${Date.now()}`,
      name: formName.trim(),
      tagline: `${formPrimaryIp.trim()} - Custom Saved DNS Server`,
      provider: formProvider.trim() || 'Custom Network',
      primaryIPv4: formPrimaryIp.trim(),
      secondaryIPv4: formSecondaryIp.trim() || '',
      dohEndpoint: formDoh.trim() || 'https://cloudflare-dns.com/dns-query',
      dohMethod: 'GET',
      location: formLocation.trim() || 'Local Network',
      category: 'Custom',
      features: {
        dnssec: formDnssec,
        malwareBlocking: formMalware,
        adBlocking: formAdBlock,
        noLogging: true,
        anycast: false,
      },
      color: '#8B5CF6',
      isCustom: true,
      createdAt: editingId ? undefined : Date.now(),
      notes: formNotes.trim(),
    };

    if (editingId) {
      onUpdateResolver(payload);
    } else {
      onAddResolver(payload);
    }

    resetForm();
  };

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Top Banner and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              DNS Server Manager & Custom Resolvers
            </h2>
            <span className="text-xs text-neutral-500">
              ({customResolvers.length} custom servers saved)
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Add, edit, and manage your private DNS servers (e.g. Pi-hole, AdGuard Home, router gateways, corporate DNS).
          </p>
        </div>

        {!isCreating && !editingId && (
          <button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom DNS Server</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Panel */}
      {(isCreating || editingId) && (
        <form
          onSubmit={handleSave}
          className="p-5 rounded-xl bg-white dark:bg-neutral-900 border-2 border-purple-500/30 dark:border-purple-500/40 shadow-md flex flex-col gap-4 text-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <span className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-600" />
              <span>{editingId ? 'Edit Custom DNS Server' : 'Add New Custom DNS Server'}</span>
            </span>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
                Server Display Name *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Home Pi-hole, Office Gateway, Private Unbound..."
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
                Provider / Organization (Optional)
              </label>
              <input
                type="text"
                value={formProvider}
                onChange={(e) => setFormProvider(e.target.value)}
                placeholder="e.g. Raspberry Pi LAN, Internal Tech Corp..."
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
                Primary IPv4 Address *
              </label>
              <input
                type="text"
                required
                value={formPrimaryIp}
                onChange={(e) => setFormPrimaryIp(e.target.value)}
                placeholder="e.g. 192.168.1.100 or 10.0.0.1"
                className="w-full px-3 py-2 font-mono rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
                Secondary IPv4 Address (Optional)
              </label>
              <input
                type="text"
                value={formSecondaryIp}
                onChange={(e) => setFormSecondaryIp(e.target.value)}
                placeholder="e.g. 192.168.1.101"
                className="w-full px-3 py-2 font-mono rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
                DoH Endpoint URL (Optional)
              </label>
              <input
                type="text"
                value={formDoh}
                onChange={(e) => setFormDoh(e.target.value)}
                placeholder="https://pihole.local/dns-query"
                className="w-full px-3 py-2 font-mono text-[11px] rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
                Location / Segment
              </label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="e.g. Local LAN, Data Center, Home Lab"
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Feature Checkboxes */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formDnssec}
                onChange={(e) => setFormDnssec(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                DNSSEC Validating
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formAdBlock}
                onChange={(e) => setFormAdBlock(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Ad / Tracker Sinkhole
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formMalware}
                onChange={(e) => setFormMalware(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Malware Shield
              </span>
            </label>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingId ? 'Save Changes' : 'Save Custom Server'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Custom Resolvers List */}
      <div className="flex flex-col gap-3">
        {customResolvers.length === 0 ? (
          <div className="p-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center flex flex-col items-center justify-center">
            <Server className="w-10 h-10 text-neutral-400 mb-2 stroke-[1.5]" />
            <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              No Custom DNS Servers Configured
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1">
              Add your private router gateway (e.g. 192.168.1.1), local Pi-hole server, or custom corporate DNS to benchmark and manage them side-by-side with global resolvers.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-4 flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Custom Server</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {customResolvers.map((resolver) => (
              <div
                key={resolver.id}
                className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-purple-400/50 transition-colors"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                          {resolver.name}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate">
                          {resolver.provider}
                        </div>
                      </div>
                    </div>

                    {/* Edit & Delete Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(resolver)}
                        className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Edit server configuration"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete custom DNS server "${resolver.name}"?`)) {
                            onDeleteResolver(resolver.id);
                          }
                        }}
                        className="p-1 rounded text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        title="Delete custom server"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* IP Addresses */}
                  <div className="mt-3 flex flex-col gap-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                      <span className="text-[10px] text-neutral-400 font-sans uppercase">Primary IP:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{resolver.primaryIPv4}</span>
                        <button
                          onClick={() => handleCopyIp(resolver.primaryIPv4)}
                          className="hover:text-purple-600 transition-colors"
                          title="Copy IP"
                        >
                          {copiedIp === resolver.primaryIPv4 ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-neutral-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {resolver.secondaryIPv4 && (
                      <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                        <span className="text-[10px] text-neutral-400 font-sans uppercase">Secondary IP:</span>
                        <span className="font-semibold">{resolver.secondaryIPv4}</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap text-[10px]">
                    {resolver.features.adBlocking && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                        Ad Sinkhole
                      </span>
                    )}
                    {resolver.features.dnssec && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        DNSSEC
                      </span>
                    )}
                    {resolver.features.malwareBlocking && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                        Malware Shield
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                  <button
                    onClick={() => onSelectResolverForProbe(resolver)}
                    className="flex-1 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>Probe Query</span>
                  </button>
                  <button
                    onClick={() => onOpenAdapterModal(resolver)}
                    className="flex-1 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Laptop className="w-3 h-3" />
                    <span>Apply to Wi-Fi</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
