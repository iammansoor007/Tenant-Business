import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Clock,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Globe,
  PhoneCall,
  Send,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Compass,
  MousePointerClick,
  Layers,
  Timer,
  Flame,
  Zap,
  Copy,
  FileText,
  Radio,
  AlertTriangle,
  Wifi,
  Battery,
  Cpu,
  MessageSquare,
  Share2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { fetchClientPitchAnalytics, clearClientPitchAnalytics } from '../../lib/apiClient';
import { playLiveArrivalChime, playHotLeadChime, sendDesktopAlert } from '../../lib/audioAlerts';
import { Tenant, PitchVisit } from '../../types/tenant';

interface PitchAnalyticsModalProps {
  tenant: Tenant;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export const PitchAnalyticsModal: React.FC<PitchAnalyticsModalProps> = ({
  tenant,
  onClose,
  onStatusUpdated,
}) => {
  const [visits, setVisits] = useState<PitchVisit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  const loadVisits = async () => {
    setIsLoading(true);
    try {
      const data = await fetchClientPitchAnalytics(tenant.slug);
      setVisits(data);
    } catch {
      setVisits([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
    const interval = setInterval(() => {
      fetchClientPitchAnalytics(tenant.slug).then((data) => {
        if (Array.isArray(data)) setVisits(data);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [tenant.slug]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleClear = async () => {
    if (confirm(`Are you sure you want to reset and clear all visitor tracking data for '${tenant.name}'?`)) {
      setIsClearing(true);
      await clearClientPitchAnalytics(tenant.slug);
      await loadVisits();
      setIsClearing(false);
      if (onStatusUpdated) onStatusUpdated();
    }
  };

  const isOpened = visits.length > 0;
  const totalVisits = visits.reduce((acc, v) => acc + (v.visitCount || 1), 0);
  const totalDurationSec = visits.reduce((acc, v) => acc + (v.durationSeconds || 0), 0);
  const maxScroll = visits.reduce((acc, v) => Math.max(acc, v.scrollDepth || 0), 0);

  const latestVisit = visits[0] as PitchVisit | undefined;
  const hasPhoneClick = visits.some((v) => v.clickedPhone);
  const hasCtaClick = visits.some((v) => v.clickedCta);
  const hasFormSubmit = visits.some((v) => v.submittedForm);

  // Format seconds into minutes and seconds
  const formatDuration = (sec: number) => {
    if (!sec || sec < 1) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  // Format date cleanly
  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Never';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + ' at ' + d.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  // All known key sections for checklist
  const allSections = [
    { label: 'Hero', name: 'Hero / Headline' },
    { label: 'About Us', name: 'Roofing Experts / About Us' },
    { label: 'Services', name: 'Core Roofing Services' },
    { label: 'Team Values', name: 'Team & Values' },
    { label: 'How We Work', name: 'How We Work Process' },
    { label: 'Portfolio', name: 'Completed Projects Portfolio' },
    { label: 'Testimonials', name: 'Client Reviews & Ratings' },
    { label: 'Quote Form', name: 'Instant Roofing Estimate Wizard' },
    { label: 'Contact Section', name: 'Direct Contact Details' },
    { label: 'FAQ', name: 'Frequently Asked Questions' },
    { label: 'Footer', name: 'Footer & Warranties' },
  ];

  // Set of all viewed sections across visits
  const viewedSectionsSet = new Set<string>();
  const sectionTimeMap: Record<string, number> = {};
  const allClickedButtons: Array<{ text: string; tag: string; href?: string; timestamp: string }> = [];
  const allRageClicks: Array<{ text: string; count: number; timestamp: string }> = [];
  const allCopiedTexts: string[] = [];
  const allTimelineEvents: Array<{ type: string; label: string; elapsedSeconds: number; timestamp: string }> = [];
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);

  const isLiveNow = Boolean(latestVisit?.lastSeen && (Date.now() - new Date(latestVisit.lastSeen).getTime() < 45000));
  const hasExitIntent = visits.some((v) => v.exitIntent);
  const leadScore = visits.reduce((acc, v) => Math.max(acc, v.engagementScore || 0), 0);
  const intentCategory: 'HOT' | 'WARM' | 'COLD' | 'BOUNCE' =
    visits.some((v) => v.intentCategory === 'HOT') ? 'HOT'
    : visits.some((v) => v.intentCategory === 'WARM') ? 'WARM'
    : visits.some((v) => v.intentCategory === 'BOUNCE') ? 'BOUNCE'
    : 'COLD';

  // Audio Radar Chime when prospect is detected live
  const prevLiveRef = useRef<boolean>(false);
  useEffect(() => {
    if (isLiveNow && !prevLiveRef.current) {
      playLiveArrivalChime();
      if (intentCategory === 'HOT') {
        playHotLeadChime();
      }
    }
    prevLiveRef.current = isLiveNow;
  }, [isLiveNow, intentCategory]);

  visits.forEach((v) => {
    (v.sectionsViewed || []).forEach((s) => viewedSectionsSet.add(s));
    if (v.sectionEngagement) {
      Object.entries(v.sectionEngagement).forEach(([sec, secTime]) => {
        sectionTimeMap[sec] = (sectionTimeMap[sec] || 0) + (Number(secTime) || 0);
      });
    }
    if (Array.isArray(v.clickedButtons)) {
      v.clickedButtons.forEach((b) => {
        allClickedButtons.push(b);
      });
    }
    if (Array.isArray(v.rageClicks)) {
      v.rageClicks.forEach((r) => {
        allRageClicks.push(r);
      });
    }
    if (Array.isArray(v.copiedTexts)) {
      v.copiedTexts.forEach((t) => {
        if (!allCopiedTexts.includes(t)) allCopiedTexts.push(t);
      });
    }
    if (Array.isArray(v.eventsTimeline)) {
      v.eventsTimeline.forEach((ev) => {
        allTimelineEvents.push(ev);
      });
    }
  });

  allClickedButtons.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  allTimelineEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Top viewed section calculation
  const totalSectionSec = Object.values(sectionTimeMap).reduce((a, b) => a + b, 0);
  let topSection = '';
  let topSectionSec = 0;
  Object.entries(sectionTimeMap).forEach(([sec, s]) => {
    if (s > topSectionSec) {
      topSectionSec = s;
      topSection = sec;
    }
  });

  // WhatsApp follow-up link
  const phoneClean = tenant.phone ? tenant.phone.replace(/[^0-9]/g, '') : '';
  const waPitchLink = typeof window !== 'undefined' ? `${window.location.origin}/${tenant.slug}` : `/${tenant.slug}`;
  const waMessage = encodeURIComponent(
    `Hi ${tenant.name}! 👋 I noticed you were just reviewing the proposal on your custom pitch link (${waPitchLink}). ` +
    (topSection ? `Specifically saw you spent time looking at our ${topSection} section. ` : '') +
    `Would love to answer any quick questions or lock in your estimate!`
  );
  const waUrl = phoneClean ? `https://wa.me/${phoneClean}?text=${waMessage}` : `https://wa.me/?text=${waMessage}`;

  const handleCopyDossier = () => {
    const report = [
      `🎯 PROSPECT INTELLIGENCE BRIEFING: ${tenant.name.toUpperCase()}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🔥 Lead Intent Score: ${leadScore}/100 (${intentCategory} LEAD)`,
      `🔴 Current Status: ${isLiveNow ? 'LIVE ON SITE RIGHT NOW' : 'Offline'}`,
      `🌐 Location: ${latestVisit?.city || 'Unknown'}, ${latestVisit?.region || ''} ${latestVisit?.country || ''}`,
      `🕒 Prospect Local Time: ${latestVisit?.prospectLocalTime || 'Unknown'} (${latestVisit?.timezone || 'Local Timezone'})`,
      `🏢 Organization / Network: ${latestVisit?.org || 'Direct'} (IP: ${latestVisit?.ip || 'Hidden'})`,
      `📶 Connection: ${latestVisit?.connectionType || 'Broadband'} ${latestVisit?.downlinkSpeed ? '• ' + latestVisit?.downlinkSpeed : ''} ${latestVisit?.rtt ? '• ' + latestVisit?.rtt : ''}`,
      `🔋 Battery Status: ${latestVisit?.batteryLevel || 'Unknown'}${latestVisit?.isCharging ? ' (Charging ⚡)' : ''}`,
      `📱 Device: ${latestVisit?.deviceModel || latestVisit?.deviceType} • ${latestVisit?.browser} (${latestVisit?.os})`,
      `🖥️ Hardware: ${latestVisit?.cpuCores ? latestVisit.cpuCores + ' CPU Cores • ' : ''}${latestVisit?.deviceMemoryGb ? latestVisit.deviceMemoryGb + 'GB RAM • ' : ''}${latestVisit?.screen || 'Standard screen'}`,
      `🔗 Referrer / Campaign: ${latestVisit?.referrerDomain || 'Direct'} ${latestVisit?.utmCampaign ? `(Campaign: ${latestVisit.utmCampaign})` : ''}`,
      `⏱️ Total Active Engagement: ${formatDuration(totalDurationSec)} (Idle: ${formatDuration(visits.reduce((a, v) => a + (v.idleSeconds || 0), 0))}, Tab Switches: ${visits.reduce((a, v) => a + (v.tabSwitches || 0), 0)})`,
      `📜 Max Scroll Depth: ${maxScroll}%`,
      `👁️ Top Focus Section: ${topSection || 'None'} (${topSectionSec}s spent)`,
      `👁️ All Sections Viewed: ${Array.from(viewedSectionsSet).join(', ') || 'None'}`,
      allRageClicks.length > 0 ? `⚡ URGENT REPEAT CLICKS: ${allRageClicks.map(r => `"${r.text}" (${r.count}x)`).join(', ')}` : '',
      `⚡ Conversion Signals: Phone Clicked: ${hasPhoneClick ? 'YES' : 'No'} | CTA Clicked: ${hasCtaClick ? 'YES' : 'No'} | Form Submitted: ${hasFormSubmit ? 'YES' : 'No'}`,
      `⚠️ Exit Intent Triggered: ${hasExitIntent ? 'YES (moved cursor to close tab)' : 'No'}`,
      allCopiedTexts.length > 0 ? `📋 Copied Content: ${allCopiedTexts.join(' | ')}` : '',
      allClickedButtons.length > 0 ? `🖱️ Clicked Actions:\n${allClickedButtons.map((b) => `  - "${b.text}" [${b.tag}] at ${formatDate(b.timestamp)}`).join('\n')}` : '',
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Generated from PitchEngine Intelligence: ${new Date().toLocaleString()}`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(report);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2500);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* ─── Header ─── */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200/50">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  {tenant.name}
                </h2>
                <span className="text-xs font-mono bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded-md">
                  /{tenant.slug}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-Time Pitch Link Engagement & Visitor Tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
            <button
              onClick={loadVisits}
              disabled={isLoading}
              title="Refresh Analytics"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── Scrollable Body ─── */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Live Online Banner */}
          {isLiveNow && (
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-pulse border border-emerald-400">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-white animate-ping shrink-0" />
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide flex items-center gap-2">
                    <span>PROSPECT IS VIEWING YOUR PITCH LIVE RIGHT NOW!</span>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Active from {latestVisit?.city || 'Local Area'} on {latestVisit?.deviceModel || 'Mobile Device'} &bull; Highly recommended to call or WhatsApp now!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-lg transition-colors shrink-0 shadow-sm flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                {tenant.phone && (
                  <a
                    href={`tel:${tenant.phone}`}
                    className="px-3.5 py-1.5 bg-white text-emerald-950 font-bold text-xs rounded-lg hover:bg-emerald-50 transition-colors shrink-0 shadow-sm flex items-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Call Now</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Rage Click / Urgency Alert Banner */}
          {allRageClicks.length > 0 && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 flex items-start gap-3 shadow-sm text-rose-950">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold uppercase tracking-wide text-rose-700">Urgent Repeated Interaction Detected ({allRageClicks.length}x)</span>
                  <span className="bg-rose-200 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Rage / Urgency Clicks</span>
                </div>
                <p className="mt-1 text-slate-700 leading-relaxed">
                  The prospect repeatedly clicked: {allRageClicks.map((r, i) => (
                    <strong key={i} className="text-rose-900 font-mono"> &ldquo;{r.text}&rdquo; ({r.count}x){i < allRageClicks.length - 1 ? ', ' : ''}</strong>
                  ))}. This indicates intense urgency to request a quote or initiate contact!
                </p>
              </div>
            </div>
          )}

          {/* Lead Intent Score Banner */}
          {isOpened && (
            <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg border border-slate-800">
              <div className="space-y-1.5 flex-1 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Prospect Buying Intent Score</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      intentCategory === 'HOT'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : intentCategory === 'WARM'
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : intentCategory === 'BOUNCE'
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {intentCategory === 'HOT'
                      ? '🔥 HOT BUYING LEAD'
                      : intentCategory === 'WARM'
                      ? '⚡ WARM PROSPECT'
                      : intentCategory === 'BOUNCE'
                      ? '↩️ BOUNCED VIEW'
                      : '❄️ COLD VIEW'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{leadScore}</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                  <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
                    Calculated from active duration, scroll %, CTA taps, form submissions &amp; backtracks
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      leadScore >= 75
                        ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                        : leadScore >= 40
                        ? 'bg-gradient-to-r from-blue-400 to-emerald-400'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${leadScore}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {hasExitIntent && (
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Exit Intent Triggered
                  </span>
                )}
                {hasPhoneClick && (
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5" />
                    Clicked Phone
                  </span>
                )}
                {hasFormSubmit && (
                  <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Submitted Form
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Status Alert Banner */}
          {isOpened ? (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-900">
                    Client Opened Your Pitch Link!
                  </h3>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Last active: <strong>{formatDate(latestVisit?.lastSeen)}</strong> &bull; Total visits: <strong>{totalVisits}</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </a>
                <a
                  href={`/${tenant.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-xs transition-colors shrink-0"
                >
                  <span>View Pitch</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Not Opened Yet
                </h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  The client has not clicked or opened their personalized pitch link yet. Send or resend the link to trigger live tracking!
                </p>
              </div>
            </div>
          )}

          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Visits */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Total Visits</span>
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalVisits}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {visits.length} unique session{visits.length === 1 ? '' : 's'}
              </div>
            </div>

            {/* Active Time Spent */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Active Time</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {formatDuration(totalDurationSec)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Idle: {formatDuration(visits.reduce((a, v) => a + (v.idleSeconds || 0), 0))}
              </div>
            </div>

            {/* Scroll Depth */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Max Scroll</span>
                <Compass className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {maxScroll}%
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, maxScroll)}%` }}
                />
              </div>
            </div>

            {/* High Intent Action */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Conversions</span>
                <PhoneCall className="w-4 h-4 text-rose-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <span className={`w-2 h-2 rounded-full ${hasPhoneClick ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span>Call Clicked: <strong>{hasPhoneClick ? 'Yes' : 'No'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <span className={`w-2 h-2 rounded-full ${hasCtaClick ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span>CTA Clicked: <strong>{hasCtaClick ? 'Yes' : 'No'}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Attention Heatmap Bar */}
          {totalSectionSec > 0 && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Prospect Attention Heatmap (Time Spent per Section)</span>
                </h4>
                {topSection && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Prospect's #1 Focus: <strong>{topSection}</strong> ({Math.round((topSectionSec / totalSectionSec) * 100)}% of time)
                  </span>
                )}
              </div>

              {/* Horizontal Stacked Bar */}
              <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
                {allSections.map(({ label }) => {
                  const sec = sectionTimeMap[label] || 0;
                  if (sec <= 0) return null;
                  const pct = Math.max(3, Math.round((sec / totalSectionSec) * 100));
                  const colorClass =
                    label === 'Hero' ? 'bg-blue-500'
                    : label === 'Services' ? 'bg-emerald-500'
                    : label === 'Quote Form' ? 'bg-amber-500'
                    : label === 'Testimonials' ? 'bg-purple-500'
                    : label === 'Contact Section' ? 'bg-rose-500'
                    : label === 'About Us' ? 'bg-sky-400'
                    : label === 'Portfolio' ? 'bg-indigo-500'
                    : 'bg-teal-500';

                  return (
                    <div
                      key={label}
                      className={`${colorClass} hover:opacity-90 transition-all cursor-pointer`}
                      style={{ width: `${pct}%` }}
                      title={`${label}: ${sec}s (${pct}%)`}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-600">
                {allSections.map(({ label }) => {
                  const sec = sectionTimeMap[label] || 0;
                  if (sec <= 0) return null;
                  const pct = Math.round((sec / totalSectionSec) * 100);
                  const dotColor =
                    label === 'Hero' ? 'bg-blue-500'
                    : label === 'Services' ? 'bg-emerald-500'
                    : label === 'Quote Form' ? 'bg-amber-500'
                    : label === 'Testimonials' ? 'bg-purple-500'
                    : label === 'Contact Section' ? 'bg-rose-500'
                    : label === 'About Us' ? 'bg-sky-400'
                    : label === 'Portfolio' ? 'bg-indigo-500'
                    : 'bg-teal-500';

                  return (
                    <span key={label} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <span>{label}: <strong>{sec}s</strong> ({pct}%)</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Visitor Device, Network & Telemetry Grid */}
          {latestVisit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location & Network */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Visitor Location & Network</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">City / State:</span>
                    <span className="font-semibold text-slate-900">
                      {[latestVisit.city, latestVisit.region, latestVisit.country].filter(Boolean).join(', ') || 'Unknown Location'}
                    </span>
                  </div>
                  {latestVisit.prospectLocalTime && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Prospect Local Time:</span>
                      <span className="font-semibold text-slate-900">
                        {latestVisit.prospectLocalTime} ({latestVisit.timezone || 'Local'})
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">IP Address:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {latestVisit.ip || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">ISP / Network:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[200px]" title={latestVisit.org}>
                      {latestVisit.org || 'Local Network / WiFi'}
                    </span>
                  </div>
                  {latestVisit.connectionType && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Connection Speed:</span>
                      <span className="font-semibold text-slate-900">
                        {latestVisit.connectionType.toUpperCase()} {latestVisit.downlinkSpeed ? `• ${latestVisit.downlinkSpeed}` : ''} {latestVisit.rtt ? `• ${latestVisit.rtt} RTT` : ''}
                      </span>
                    </div>
                  )}
                  {latestVisit.referrerDomain && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Referrer / Source:</span>
                      <span className="font-semibold text-slate-900">
                        {latestVisit.referrerDomain} {latestVisit.utmCampaign ? `(${latestVisit.utmCampaign})` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Device & Hardware Telemetry */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  {latestVisit.deviceType === 'Mobile' ? (
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                  ) : latestVisit.deviceType === 'Tablet' ? (
                    <Tablet className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Monitor className="w-4 h-4 text-blue-600" />
                  )}
                  <span>Device & Hardware Specs</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Device Model:</span>
                    <span className="font-semibold text-slate-900">
                      {latestVisit.deviceModel || latestVisit.deviceType || 'Desktop'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Operating System:</span>
                    <span className="font-semibold text-slate-900">
                      {latestVisit.os || 'Unknown OS'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Web Browser:</span>
                    <span className="font-semibold text-slate-900">
                      {latestVisit.browser || 'Unknown Browser'}
                    </span>
                  </div>
                  {latestVisit.batteryLevel && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Device Battery:</span>
                      <span className="font-semibold text-slate-900">
                        {latestVisit.batteryLevel} {latestVisit.isCharging ? '(Charging ⚡)' : '(On Battery)'}
                      </span>
                    </div>
                  )}
                  {(latestVisit.cpuCores || latestVisit.deviceMemoryGb) ? (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Hardware:</span>
                      <span className="font-semibold text-slate-900">
                        {latestVisit.cpuCores ? `${latestVisit.cpuCores} Cores` : ''} {latestVisit.deviceMemoryGb ? `• ${latestVisit.deviceMemoryGb}GB RAM` : ''}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Screen Resolution:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {latestVisit.screen || 'Standard Viewport'} {latestVisit.pixelRatio ? `(${latestVisit.pixelRatio})` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sections Reached Checklist */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Sections Viewed on Website ({viewedSectionsSet.size} / {allSections.length})</span>
              </h4>
              <span className="text-xs text-slate-500">Based on prospect's scroll position</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
              {allSections.map(({ label, name }) => {
                const wasViewed = viewedSectionsSet.has(label);
                const sectionSec = sectionTimeMap[label] || 0;
                return (
                  <div
                    key={label}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-1.5 transition-all ${
                      wasViewed
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                          wasViewed
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {wasViewed ? '✓' : ''}
                      </span>
                      <span className="truncate" title={name}>{label}</span>
                    </div>
                    {wasViewed && sectionSec > 0 && (
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded shrink-0">
                        {sectionSec}s
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buttons & Actions Clicked Feed */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-blue-600" />
                <span>Clicked Buttons & Interactions ({allClickedButtons.length})</span>
              </h4>
              <span className="text-xs text-slate-500">Real-time button & conversion taps</span>
            </div>

            {allClickedButtons.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                No buttons clicked yet. The prospect viewed sections but hasn't tapped any buttons or phone numbers.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                {allClickedButtons.map((btn, idx) => {
                  const isPhone = btn.href?.startsWith('tel:') || btn.text.toLowerCase().includes('call');
                  const isForm = btn.tag === 'FORM' || btn.text.toLowerCase().includes('submitted');
                  const isCta = btn.text.toLowerCase().includes('quote') || btn.text.toLowerCase().includes('estimate');

                  return (
                    <div key={idx} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            isForm
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold'
                              : isPhone
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isCta
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isForm ? 'FORM SUBMIT' : isPhone ? 'PHONE' : isCta ? 'QUOTE CTA' : btn.tag}
                        </span>
                        <span className="font-semibold text-slate-900 truncate">
                          &ldquo;{btn.text}&rdquo;
                        </span>
                        {btn.href && !isPhone && (
                          <span className="text-[11px] text-slate-400 font-mono truncate hidden sm:inline">
                            &rarr; {btn.href}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono shrink-0">
                        {formatDate(btn.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Copied Text Snippets (High-Intent Signal) */}
          {allCopiedTexts.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-950 flex items-center gap-2 text-sm">
                  <Copy className="w-4 h-4 text-amber-700" />
                  <span>Content Copied by Prospect ({allCopiedTexts.length})</span>
                </h4>
                <span className="text-[11px] text-amber-700 font-medium">Strong buying / research signal</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {allCopiedTexts.map((text, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-amber-200 text-slate-800 font-mono text-xs flex items-center justify-between gap-2 shadow-2xs">
                    <span className="truncate">&ldquo;{text}&rdquo;</span>
                    <span className="text-[10px] text-amber-700 font-bold uppercase shrink-0">Copied</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chronological Activity Stream */}
          {allTimelineEvents.length > 0 && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Chronological Prospect Activity Stream ({allTimelineEvents.length})</span>
                </h4>
                <span className="text-xs text-slate-500">Live sequence of interactions</span>
              </div>

              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs border border-slate-200 rounded-lg">
                {allTimelineEvents.map((ev, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 shrink-0">
                        +{ev.elapsedSeconds}s
                      </span>
                      <span className="font-semibold text-slate-800 truncate">
                        {ev.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {formatDate(ev.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session History Log */}
          {visits.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900">
                Visitor Sessions Timeline ({visits.length})
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {visits.map((v, i) => (
                  <div key={v.sessionId || i} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center shrink-0">
                        #{visits.length - i}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center flex-wrap gap-1.5">
                          <span>{v.deviceModel || v.deviceType || 'Visitor'} &bull; {v.browser || 'Web'}</span>
                          {v.isAdminPreview && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[10px] font-medium border border-purple-200">
                              Admin Test
                            </span>
                          )}
                          {v.city && (
                            <span className="text-slate-500 font-normal">from {v.city}, {v.region}</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          IP: {v.ip || 'Unknown'} &bull; {v.org || 'Direct visit'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-600 shrink-0">
                      <div className="text-right">
                        <span className="font-semibold text-slate-900">{formatDuration(v.durationSeconds)} active</span>
                        <div className="text-[11px] text-slate-500">{v.scrollDepth}% scrolled</div>
                      </div>
                      <div className="text-right text-[11px] text-slate-400">
                        {formatDate(v.lastSeen)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              disabled={isClearing || visits.length === 0}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Analytics</span>
            </button>

            {isOpened && (
              <button
                onClick={handleCopyDossier}
                className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="Copy client dossier to clipboard before calling"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedDossier ? 'Copied Briefing Dossier!' : 'Copy Sales Briefing'}</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
