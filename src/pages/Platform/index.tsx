import React, { useState, useEffect } from 'react';
import { Tenant } from '../../types/tenant';
import {
  fetchAllTenants,
  saveTenant,
  deleteTenant,
  bulkDeleteTenants,
  bulkUpdateTenantStatus,
  getAuthToken,
  removeAuthToken,
} from '../../lib/apiClient';
import { Login } from './Login';
import { ClientEditor } from './ClientEditor';
import { BulkCreator } from './BulkCreator';
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
} from 'lucide-react';

export const PlatformDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getAuthToken());
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dbStatus, setDbStatus] = useState<string>('Checking...');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  // Navigation views: 'list' | 'create' | 'edit' | 'bulk'
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'bulk'>('list');
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await fetchAllTenants();
      setTenants(list);

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
    }
  }, [isAuthenticated]);

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

  // Filtered tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pitched">Pitched</option>
                  <option value="draft">Draft</option>
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

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
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
      </main>
    </div>
  );
};

export default PlatformDashboard;

