import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { Copy, CheckCircle, Settings, X, Edit3, SlidersHorizontal } from 'lucide-react';

export const PitchToolbar: React.FC = () => {
  const { tenant, isCustomTenant } = useTenant();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  // If this is the default root site without a tenant, hide or show subtle admin trigger
  if (!isCustomTenant && !tenant) return null;

  const clientName = tenant?.name || 'Client Pitch';
  const url = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 p-2.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-xl backdrop-blur-md hover:text-slate-900 hover:scale-105 transition-all"
        title="Open Pitch Tools"
      >
        <SlidersHorizontal className="w-4 h-4 text-blue-600" />
      </button>
    );
  }

  return (
    <aside aria-label="Pitch Mode Toolbar" className="fixed bottom-4 right-4 z-50 bg-white/95 border border-slate-200 rounded-xl p-2.5 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs text-slate-700 font-sans">
      <div className="flex items-center gap-2 pl-1">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="font-semibold text-slate-900 max-w-[140px] truncate">{clientName}</span>
      </div>

      <div className="h-3.5 w-px bg-slate-200" />

      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-medium transition-colors border border-slate-200/60"
      >
        {copied ? (
          <>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600 font-semibold">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      <a
        href={`/platform?edit=${tenant?.slug || ''}`}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-medium transition-colors border border-slate-200/60"
        title="Edit this client's branding, phone, and JSON"
      >
        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
        <span>Edit Pitch</span>
      </a>

      <a
        href="/platform"
        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-medium transition-colors border border-slate-200/60"
        title="Go to Platform Admin"
      >
        <Settings className="w-3.5 h-3.5 text-slate-500" />
        <span>Platform</span>
      </a>

      <button
        onClick={() => setIsCollapsed(true)}
        className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
        title="Minimize toolbar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};

