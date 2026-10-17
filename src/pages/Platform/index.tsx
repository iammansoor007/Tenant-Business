import React, { useState, useEffect } from 'react';
import { Tenant } from '../../types/tenant';
import {
  fetchAllTenants,
  saveTenant,
  deleteTenant,
  bulkDeleteTenants,
  bulkUpdateTenantStatus,
  fetchPitchAnalyticsSummary,
  getAuthToken,
  removeAuthToken,
} from '../../lib/apiClient';
import { Login } from './Login';
import { ClientEditor } from './ClientEditor';
import { BulkCreator } from './BulkCreator';
import { PitchAnalyticsModal } from './PitchAnalyticsModal';
import {
  Plus,
  Zap,
  Search,
  Copy,
  ExternalLink,
  Edit,
  Trash2,
  Database,
  Download,
  Upload,
  LogOut,
  Building2,
  CheckCircle,
  Eye,
  LayoutGrid,
  List,
  Phone,
  MapPin,
  Globe,
  SlidersHorizontal,
  CheckSquare,
  Activity,
  TrendingUp,
  Clock,
  Compass,
  PhoneCall,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
} from 'lucide-react';
import {
  isAudioAlertsEnabled,
  setAudioAlertsEnabled,
  playLiveArrivalChime,
  playHotLeadChime,
  sendDesktopAlert,
} from '../../lib/audioAlerts';

export const PlatformDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getAuthToken());
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<Record<string, any>>({});
  const [viewingAnalyticsTenant, setViewingAnalyticsTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dbStatus, setDbStatus] = useState<string>('Checking...');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(isAudioAlertsEnabled());
  const prevLiveSlugsRef = React.useRef<Set<string>>(new Set());

  // Navigation views: 'list' | 'create' | 'edit' | 'bulk'
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'bulk'>('list');
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [list, analytics] = await Promise.all([
        fetchAllTenants(),
        fetchPitchAnalyticsSummary(),
      ]);
      setTenants(list);
      setAnalyticsSummary(analytics || {});

      // Check for ?edit=slug parameter in URL to auto-open editor
      const urlParams = new URLSearchParams(window.location.search);
      const editSlug = urlParams.get('edit');
      if (editSlug) {
        const found = list.find((t) => t.slug === editSlug);
        if (found) {
          setEditingTenant(found);
          setView('edit');
          window.history.replaceState({}, '', window.location.pathname);
        }
      }

      // Check server status
      try {
        const statusRes = await fetch('/api/status');
        if (statusRes.ok) {
          const s = await statusRes.json();
          setDbStatus(s.database || 'Online');
        } else {
          setDbStatus('Local Store');
        }
      } catch {
        setDbStatus('Local Store');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const interval = setInterval(() => {
        fetchPitchAnalyticsSummary().then((summary) => {
          if (summary && Object.keys(summary).length > 0) {
            setAnalyticsSummary(summary);
          }
        });
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Real-Time Radar Chime & Desktop Push Notification when a prospect enters
  useEffect(() => {
    const currentLive = new Set<string>();
    Object.values(analyticsSummary).forEach((item: any) => {
      if (item && item.isLiveNow) {
        currentLive.add(item.slug);
        if (!prevLiveSlugsRef.current.has(item.slug)) {
          // New prospect arrival!
          playLiveArrivalChime();
          if (item.intentCategory === 'HOT') {
            playHotLeadChime();
          }
          const matchedTenant = tenants.find((t) => t.slug === item.slug);
          const name = matchedTenant?.name || item.slug;
          sendDesktopAlert(
            name,
            `Prospect is actively browsing your proposal pitch right now from ${item.latestLocation || 'their device'}!`
          );
        }
      }
    });
    prevLiveSlugsRef.current = currentLive;
  }, [analyticsSummary, tenants]);

  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
  };

  const handleSaveClient = async (tenantToSave: Tenant) => {
    // If the client's URL slug was renamed, delete the old slug to prevent duplicate ghost clients
    if (editingTenant && editingTenant.slug && editingTenant.slug !== tenantToSave.slug) {
      await deleteTenant(editingTenant.slug);
    }
    await saveTenant(tenantToSave);
    await loadData();
    setView('list');
    setEditingTenant(null);
  };

  const handleDeleteClient = async (slug: string) => {
    if (confirm(`Are you sure you want to delete client '${slug}'?`)) {
      await deleteTenant(slug);
      setSelectedSlugs((prev) => prev.filter((s) => s !== slug));
      await loadData();
    }
  };

  const handleToggleSelect = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSelectAll = (filteredList: Tenant[]) => {
    if (selectedSlugs.length === filteredList.length && filteredList.length > 0) {
      setSelectedSlugs([]);
    } else {
      setSelectedSlugs(filteredList.map((t) => t.slug));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSlugs.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedSlugs.length} selected clients? This cannot be undone.`)) {
      setIsLoading(true);
      try {
        await bulkDeleteTenants(selectedSlugs);
        setSelectedSlugs([]);
        await loadData();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBulkStatusChange = async (newStatus: 'active' | 'draft' | 'pitched') => {
    if (selectedSlugs.length === 0) return;
    setIsLoading(true);
    try {
      await bulkUpdateTenantStatus(selectedSlugs, newStatus);
      setSelectedSlugs([]);
      await loadData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tenants, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `pitchengine_clients_backup_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          for (const item of imported) {
            if (item.slug && item.name) {
              await saveTenant(item);
            }
          }
          await loadData();
          alert(`Successfully imported ${imported.length} clients!`);
        } else {
          alert('JSON file must contain an array of clients');
        }
      } catch (err: any) {
        alert(`Failed to import JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return <Login onSuccess={() => setIsAuthenticated(true)} />;
  }

  const formatShortDuration = (sec: number) => {
    if (!sec || sec < 1) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  // Filtered tenants
  const totalLivePitches = tenants.filter((t) => analyticsSummary[t.slug]?.isLiveNow).length;
  const totalHotLeads = tenants.filter(
    (t) =>
      analyticsSummary[t.slug]?.intentCategory === 'HOT' ||
      (analyticsSummary[t.slug]?.engagementScore || 0) >= 75
  ).length;

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const isClientOpened = Boolean(analyticsSummary[t.slug]?.isOpened);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'live' && Boolean(analyticsSummary[t.slug]?.isLiveNow)) ||
      (statusFilter === 'hot' &&
        (analyticsSummary[t.slug]?.intentCategory === 'HOT' ||
          (analyticsSummary[t.slug]?.engagementScore || 0) >= 75)) ||
      (statusFilter === 'opened' && isClientOpened) ||
      (statusFilter === 'unopened' && !isClientOpened) ||
      t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate live aggregate pitch analytics
  const totalOpenedPitches = tenants.filter((t) => analyticsSummary[t.slug]?.isOpened).length;
  const totalEngagementSec = Object.values(analyticsSummary).reduce((acc: number, s: any) => acc + (s?.totalDurationSeconds || 0), 0);
  const totalConversions = Object.values(analyticsSummary).reduce((acc: number, s: any) => acc + (s?.clickedPhone ? 1 : 0) + (s?.clickedCta ? 1 : 0) + (s?.submittedForm ? 1 : 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Sleek Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">PitchEngine</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                Agency
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{dbStatus}</span>
            </div>

            {/* Live Prospect Sound Alerts Toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                setAudioAlertsEnabled(next);
                if (next) playLiveArrivalChime();
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 shadow-2xs'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
              title={soundEnabled ? 'Live Prospect Audio Alerts: ON (Click to mute)' : 'Live Prospect Audio Alerts: MUTED (Click to unmute)'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden lg:inline">{soundEnabled ? 'Live Chimes ON' : 'Muted'}</span>
            </button>

            <button
              onClick={handleExportJson}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-xs transition-colors"
              title="Download all clients as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            <label className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-xs transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Import
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {view === 'create' && (
          <ClientEditor
            onSave={handleSaveClient}
            onCancel={() => setView('list')}
          />
        )}

        {view === 'edit' && editingTenant && (
          <ClientEditor
            initialTenant={editingTenant}
            onSave={handleSaveClient}
            onCancel={() => {
              setView('list');
              setEditingTenant(null);
            }}
          />
        )}

        {view === 'bulk' && (
          <BulkCreator
            onSuccess={() => {
              loadData();
              setView('list');
            }}
            onCancel={() => setView('list')}
          />
        )}

        {view === 'list' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Pitches</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Manage personalized client pitch websites with custom branding, phone numbers, and domains.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setView('bulk')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Bulk 100+ Clients
                </button>

                <button
                  onClick={() => {
                    setEditingTenant(null);
                    setView('create');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Client Pitch
                </button>
              </div>
            </div>

            {/* 4 Live Pitch Analytics Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Total Generated</span>
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{tenants.length}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Active client pitches</div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Opened Links</span>
                  <Eye className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                  <span>{totalOpenedPitches}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {tenants.length > 0 ? `${Math.round((totalOpenedPitches / tenants.length) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Prospects who clicked your link</div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Total Attention</span>
                  <Clock className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{formatShortDuration(totalEngagementSec)}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Total time spent reading pitches</div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">High-Intent Actions</span>
                  <PhoneCall className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{totalConversions}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Phone &amp; CTA button clicks</div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by client name or /slug..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs text-slate-500">
                  Total Clients: <strong className="text-slate-900">{tenants.length}</strong>
                </span>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="all">All Pitches</option>
                  {totalLivePitches > 0 && (
                    <option value="live">🔴 Live On Site Now ({totalLivePitches})</option>
                  )}
                  {totalHotLeads > 0 && (
                    <option value="hot">🔥 Hot Buying Leads ({totalHotLeads})</option>
                  )}
                  <option value="opened">🟢 Opened Links ({totalOpenedPitches})</option>
                  <option value="unopened">⚪ Unopened Links ({tenants.length - totalOpenedPitches})</option>
                  <option value="active">Active Status</option>
                  <option value="pitched">Pitched Status</option>
                  <option value="draft">Draft Status</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded text-xs transition-colors ${
                      viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Table View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded text-xs transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Card Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Selection Action Bar */}
            {selectedSlugs.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900">
                    {selectedSlugs.length} client{selectedSlugs.length > 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setSelectedSlugs([])}
                    className="text-xs text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                  >
                    Deselect all
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Bulk Status:</span>
                  <button
                    onClick={() => handleBulkStatusChange('active')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors border border-emerald-300/60 cursor-pointer"
                  >
                    Set Active
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('pitched')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors border border-blue-300/60 cursor-pointer"
                  >
                    Set Pitched
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('draft')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors border border-amber-300/60 cursor-pointer"
                  >
                    Set Draft
                  </button>

                  <div className="h-4 w-px bg-slate-300 mx-1" />

                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete ({selectedSlugs.length})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Client Pitches Presentation */}
            {isLoading ? (
              <div className="p-16 text-center text-slate-500 text-sm">
                Loading client pitches...
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No clients found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery
                    ? 'No client pitches match your search criteria.'
                    : 'Click "New Client Pitch" or "Bulk 100+ Clients" above to generate your first pitches.'}
                </p>
              </div>
            ) : viewMode === 'table' ? (
              /* MODERN TABLE VIEW */
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            aria-label="Select all clients"
                            checked={filteredTenants.length > 0 && selectedSlugs.length === filteredTenants.length}
                            onChange={() => handleSelectAll(filteredTenants)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-4">Client Company</th>
                        <th className="py-3 px-4">Pitch URL</th>
                        <th className="py-3 px-4 hidden md:table-cell">Location</th>
                        <th className="py-3 px-4 hidden sm:table-cell">Contact Phone</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Pitch Activity</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTenants.map((t) => {
                        const isTenantFlagship = t.slug === 'max-quality-roofing';
                        const rawPhone = t.phone || t.completeData?.footer?.contact?.phone || t.completeData?.contact?.phone;
                        const isFlagshipPhone = rawPhone?.includes('406') && rawPhone?.includes('217-1720');
                        const phone = (!isTenantFlagship && isFlagshipPhone) ? '—' : (rawPhone || (isTenantFlagship ? '(406) 217-1720' : '—'));

                        const rawLocation = t.location || t.completeData?.footer?.serviceAreas?.items?.[0] || t.completeData?.footer?.company?.subTitle || t.completeData?.city;
                        const isFlagshipLocation = rawLocation?.includes('Great Falls');
                        const location = (!isTenantFlagship && isFlagshipLocation) ? '—' : (rawLocation || (isTenantFlagship ? 'Great Falls, MT' : '—'));

                        const isSelected = selectedSlugs.includes(t.slug);
                        const analytics = analyticsSummary[t.slug];

                        return (
                          <tr key={t.slug} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                            {/* Checkbox */}
                            <td className="py-3.5 px-3 w-10 text-center">
                              <input
                                type="checkbox"
                                aria-label={`Select ${t.name}`}
                                checked={isSelected}
                                onChange={() => handleToggleSelect(t.slug)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>

                            {/* Client Company */}
                            <td className="py-3.5 px-4 font-medium text-slate-900">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-[11px] shrink-0 border border-black/10 shadow-xs"
                                  style={{
                                    backgroundColor: t.colors?.primary || '#0B1D33',
                                  }}
                                >
                                  {t.media?.logo ? (
                                    <img src={t.media.logo} alt={t.name} className="w-full h-full object-contain p-0.5 rounded-lg" />
                                  ) : (
                                    t.name.slice(0, 2).toUpperCase()
                                  )}
                                </div>
                                <span className="font-bold text-slate-900">{t.name}</span>
                              </div>
                            </td>

                            {/* Pitch URL */}
                            <td className="py-3.5 px-4 font-mono text-blue-600">
                              <div className="flex items-center gap-2">
                                <a
                                  href={`/${t.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline flex items-center gap-1 truncate max-w-[160px] font-semibold"
                                >
                                  /{t.slug}
                                </a>
                                <button
                                  onClick={() => handleCopyLink(t.slug)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors"
                                  title="Copy Pitch Link"
                                >
                                  {copiedSlug === t.slug ? (
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* Location */}
                            <td className="py-3.5 px-4 text-slate-600 hidden md:table-cell">
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[140px]">{location}</span>
                              </span>
                            </td>

                            {/* Phone */}
                            <td className="py-3.5 px-4 text-slate-600 hidden sm:table-cell">
                              <span className="flex items-center gap-1.5 font-mono">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{phone}</span>
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                  t.status === 'pitched'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {t.status || 'Active'}
                              </span>
                            </td>

                            {/* Pitch Activity */}
                            <td className="py-3.5 px-4">
                              {analytics?.isLiveNow ? (
                                <button
                                  onClick={() => setViewingAnalyticsTenant(t)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-colors animate-pulse cursor-pointer"
                                  title="Client is viewing this pitch link RIGHT NOW!"
                                >
                                  <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
                                  <span>LIVE ON SITE NOW</span>
                                  {analytics.intentCategory === 'HOT' && <span>🔥</span>}
                                </button>
                              ) : analytics?.isOpened ? (
                                <button
                                  onClick={() => setViewingAnalyticsTenant(t)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs group text-left cursor-pointer"
                                  title="Click to view detailed visitor tracking, IP & device"
                                >
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                  <span>Opened ({analytics.totalVisits}x)</span>
                                  {analytics.intentCategory === 'HOT' ? (
                                    <span className="text-rose-700 font-extrabold bg-rose-100 px-1.5 py-0.2 rounded text-[10px] border border-rose-200">
                                      🔥 HOT
                                    </span>
                                  ) : analytics.intentCategory === 'WARM' ? (
                                    <span className="text-amber-800 font-bold bg-amber-100 px-1 rounded text-[10px] border border-amber-200">
                                      ⚡ WARM
                                    </span>
                                  ) : null}
                                  {analytics.rageClicksCount > 0 && (
                                    <span className="text-rose-700 font-extrabold bg-rose-100 px-1.5 py-0.2 rounded text-[10px] border border-rose-200">
                                      ⚡ URGENT
                                    </span>
                                  )}
                                  <span className="text-emerald-600 font-normal">&bull; {formatShortDuration(analytics.totalDurationSeconds)}</span>
                                  <span className="text-emerald-600 font-normal">&bull; {analytics.maxScrollDepth}% scroll</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => setViewingAnalyticsTenant(t)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200/70 transition-colors cursor-pointer"
                                  title="Click to check link status"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                  <span>Unopened</span>
                                </button>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => setViewingAnalyticsTenant(t)}
                                  className={`p-1.5 rounded-lg border shadow-xs transition-colors ${
                                    analytics?.isOpened
                                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                                  }`}
                                  title="View Live Link Analytics & Visitor Timeline"
                                >
                                  <Activity className="w-3.5 h-3.5" />
                                </button>

                                <a
                                  href={`/${t.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-xs transition-colors"
                                  title="Open Pitch in New Tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>

                                <button
                                  onClick={() => {
                                    setEditingTenant(t);
                                    setView('edit');
                                  }}
                                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-xs transition-colors"
                                  title="Edit Client"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteClient(t.slug)}
                                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 shadow-xs transition-colors"
                                  title="Delete client"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* CLEAN CARD GRID VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTenants.map((t) => {
                  const isTenantFlagship = t.slug === 'max-quality-roofing';
                  const rawPhone = t.phone || t.completeData?.footer?.contact?.phone || t.completeData?.contact?.phone;
                  const isFlagshipPhone = rawPhone?.includes('406') && rawPhone?.includes('217-1720');
                  const phone = (!isTenantFlagship && isFlagshipPhone) ? '—' : (rawPhone || (isTenantFlagship ? '(406) 217-1720' : '—'));

                  const rawLocation = t.location || t.completeData?.footer?.serviceAreas?.items?.[0] || t.completeData?.footer?.company?.subTitle || t.completeData?.city;
                  const isFlagshipLocation = rawLocation?.includes('Great Falls');
                  const location = (!isTenantFlagship && isFlagshipLocation) ? '—' : (rawLocation || (isTenantFlagship ? 'Great Falls, MT' : '—'));
                  const analytics = analyticsSummary[t.slug];

                  return (
                    <div
                      key={t.slug}
                      className={`bg-white border ${
                        selectedSlugs.includes(t.slug) ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200'
                      } hover:border-slate-300 rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between`}
                    >
                      <div>
                        {/* Top Card Info */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              aria-label={`Select ${t.name}`}
                              checked={selectedSlugs.includes(t.slug)}
                              onChange={() => handleToggleSelect(t.slug)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                            />
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 border border-black/10 shadow-xs"
                              style={{
                                backgroundColor: t.colors?.primary || '#0B1D33',
                              }}
                            >
                              {t.media?.logo ? (
                                <img src={t.media.logo} alt={t.name} className="w-full h-full object-contain p-0.5 rounded-lg" />
                              ) : (
                                t.name.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">
                                {t.name}
                              </h3>
                              <a
                                href={`/${t.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-mono text-blue-600 font-semibold hover:underline flex items-center gap-1"
                              >
                                /{t.slug}
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              t.status === 'pitched'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {t.status || 'Active'}
                          </span>
                        </div>

                        {/* Live Pitch Engagement Status Badge */}
                        <div className="my-2.5">
                          {analytics?.isLiveNow ? (
                            <button
                              onClick={() => setViewingAnalyticsTenant(t)}
                              className="w-full flex items-center justify-between p-2 rounded-lg bg-emerald-600 text-white text-[11px] font-extrabold shadow-sm hover:bg-emerald-700 transition-colors animate-pulse cursor-pointer"
                              title="Client is viewing this pitch link RIGHT NOW!"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                <span>LIVE ON SITE NOW</span>
                              </div>
                              <span className="bg-emerald-700/60 px-1.5 py-0.5 rounded text-[10px]">
                                {analytics.intentCategory === 'HOT' ? '🔥 HOT LEAD' : 'ACTIVE'}
                              </span>
                            </button>
                          ) : analytics?.isOpened ? (
                            <button
                              onClick={() => setViewingAnalyticsTenant(t)}
                              className="w-full flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-900 hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Click to view full visitor tracking timeline"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Opened ({analytics.totalVisits}x)</span>
                                {analytics.intentCategory === 'HOT' && (
                                  <span className="text-rose-700 font-extrabold bg-rose-100 px-1 py-0.2 rounded text-[10px]">
                                    🔥 HOT
                                  </span>
                                )}
                                {analytics.rageClicksCount > 0 && (
                                  <span className="text-rose-700 font-extrabold bg-rose-100 px-1 py-0.2 rounded text-[10px]">
                                    ⚡ URGENT
                                  </span>
                                )}
                              </div>
                              <span className="text-emerald-700 font-normal">
                                {formatShortDuration(analytics.totalDurationSeconds)} &bull; {analytics.maxScrollDepth}% scroll
                              </span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span>Not opened yet</span>
                            </div>
                          )}
                        </div>

                        {/* Real Contact & Location Details */}
                        <div className="space-y-1.5 text-xs text-slate-600 my-3 pt-3 border-t border-slate-100">
                          <p className="flex items-center gap-2 truncate">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-mono">{phone}</span>
                          </p>
                          <p className="flex items-center gap-2 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{location}</span>
                          </p>
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleCopyLink(t.slug)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
                        >
                          {copiedSlug === t.slug ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setViewingAnalyticsTenant(t)}
                          className={`p-1.5 rounded-lg border shadow-xs transition-colors ${
                            analytics?.isOpened
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                          }`}
                          title="View Live Link Analytics"
                        >
                          <Activity className="w-4 h-4" />
                        </button>

                        <a
                          href={`/${t.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-xs transition-colors"
                          title="Open Pitch in New Tab"
                        >
                          <Eye className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => {
                            setEditingTenant(t);
                            setView('edit');
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-xs transition-colors"
                          title="Edit Client"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteClient(t.slug)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 shadow-xs transition-colors"
                          title="Delete client"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Real-time Link Tracking & Visitor Analytics Modal */}
        {viewingAnalyticsTenant && (
          <PitchAnalyticsModal
            tenant={viewingAnalyticsTenant}
            onClose={() => setViewingAnalyticsTenant(null)}
            onStatusUpdated={() => loadData()}
          />
        )}
      </main>
    </div>
  );
};

export default PlatformDashboard;

