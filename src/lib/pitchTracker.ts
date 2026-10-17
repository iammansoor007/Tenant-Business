import { useEffect, useRef } from 'react';
import { trackPitchEvent } from './apiClient';

interface GeoLocationData {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  org?: string;
}

let cachedGeo: GeoLocationData | null = null;
let geoFetchPromise: Promise<GeoLocationData> | null = null;

// Fetch IP and Geo Location asynchronously with a strict 2.5s timeout
async function getGeoLocation(): Promise<GeoLocationData> {
  if (cachedGeo && cachedGeo.ip) return cachedGeo;
  if (geoFetchPromise) return geoFetchPromise;

  geoFetchPromise = (async () => {
    // 1. Try ipapi.co with 2500ms timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch('https://ipapi.co/json/', {
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        cachedGeo = {
          ip: data.ip || '',
          city: data.city || '',
          region: data.region || data.region_code || '',
          country: data.country_name || data.country || '',
          org: data.org || '',
        };
        return cachedGeo;
      }
    } catch {}

    // 2. Secondary fallback: ipify with 2000ms timeout
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 2000);

      const res2 = await fetch('https://api.ipify.org?format=json', {
        signal: controller2.signal,
      });
      clearTimeout(timeoutId2);

      if (res2.ok) {
        const data2 = await res2.json();
        cachedGeo = { ip: data2.ip || '' };
        return cachedGeo;
      }
    } catch {}

    cachedGeo = {};
    return cachedGeo;
  })();

  return geoFetchPromise;
}

// In-depth Device, Browser, In-App WebView, and OS detector
function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'Desktop' as const,
      deviceModel: 'Desktop',
      browser: 'Unknown',
      os: 'Unknown',
      screen: '',
      language: '',
    };
  }

  const ua = navigator.userAgent || '';
  const screen = `${window.screen.width}x${window.screen.height}`;
  const language = navigator.language || '';

  // Detect Device Type
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(ua);
  const isMobile = /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(ua);

  if (isTablet) deviceType = 'Tablet';
  else if (isMobile || window.innerWidth <= 768) deviceType = 'Mobile';

  // Detect Device Model
  let deviceModel = 'PC / Mac';
  if (/iPhone/i.test(ua)) deviceModel = 'iPhone';
  else if (/iPad/i.test(ua)) deviceModel = 'iPad';
  else if (/Samsung|SM-|GT-/i.test(ua)) deviceModel = 'Samsung Galaxy';
  else if (/Pixel/i.test(ua)) deviceModel = 'Google Pixel';
  else if (/Macintosh|Mac OS X/i.test(ua)) deviceModel = 'Mac';
  else if (/Windows/i.test(ua)) deviceModel = 'Windows PC';
  else if (/Linux/i.test(ua)) deviceModel = 'Linux Device';

  // Detect OS
  let os = 'Unknown OS';
  if (/iPhone OS|iPad; CPU OS/i.test(ua)) {
    const match = ua.match(/OS (\d+[_\d]*)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  } else if (/Android/i.test(ua)) {
    const match = ua.match(/Android (\d+(\.\d+)?)/);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua)) {
    const match = ua.match(/Mac OS X (\d+[_\d]*)/);
    os = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
  }

  // Detect In-App Social Browsers vs Standard Web Browsers
  let browser = 'Unknown Browser';
  if (/Instagram/i.test(ua)) browser = 'Instagram In-App Browser';
  else if (/FBAN|FBAV/i.test(ua)) browser = 'Facebook App';
  else if (/LinkedInApp/i.test(ua)) browser = 'LinkedIn App';
  else if (/WhatsApp/i.test(ua)) browser = 'WhatsApp Webview';
  else if (/musical_ly|BytedanceWebview/i.test(ua)) browser = 'TikTok In-App Browser';
  else if (/Twitter/i.test(ua)) browser = 'X (Twitter) App';
  else if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Google Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Apple Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';
  else if (/OPR\//i.test(ua)) browser = 'Opera';

  return { deviceType, deviceModel, browser, os, screen, language };
}

// In-depth Connection, Battery, UTM, Local Time, and Hardware Telemetry
function getExtendedTelemetry() {
  if (typeof window === 'undefined') return {};

  let timezone = '';
  let prospectLocalTime = '';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    prospectLocalTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {}

  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const connectionType = conn ? (conn.effectiveType || conn.type || '') : '';
  const downlinkSpeed = conn && conn.downlink ? `${conn.downlink} Mbps` : '';
  const rtt = conn && conn.rtt ? `${conn.rtt} ms` : '';

  const cpuCores = navigator.hardwareConcurrency || 0;
  const deviceMemoryGb = (navigator as any).deviceMemory || 0;
  const pixelRatio = window.devicePixelRatio ? `${window.devicePixelRatio}x` : '1x';
  const screenOrientation = window.screen?.orientation?.type || (window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');

  let utmSource = '';
  let utmMedium = '';
  let utmCampaign = '';
  try {
    const params = new URLSearchParams(window.location.search);
    utmSource = params.get('utm_source') || '';
    utmMedium = params.get('utm_medium') || '';
    utmCampaign = params.get('utm_campaign') || '';
  } catch {}

  let referrerDomain = 'Direct / Bookmarked';
  try {
    if (document.referrer) {
      const refUrl = new URL(document.referrer);
      const host = refUrl.hostname.replace('www.', '').toLowerCase();
      if (host.includes('linkedin')) referrerDomain = 'LinkedIn';
      else if (host.includes('facebook') || host.includes('fb.')) referrerDomain = 'Facebook';
      else if (host.includes('instagram')) referrerDomain = 'Instagram';
      else if (host.includes('whatsapp') || host.includes('wa.me')) referrerDomain = 'WhatsApp';
      else if (host.includes('google')) referrerDomain = 'Google Search';
      else if (host.includes('twitter') || host.includes('x.com')) referrerDomain = 'X (Twitter)';
      else if (host.includes('mail')) referrerDomain = 'Email Webmail';
      else referrerDomain = host;
    }
  } catch {}

  return {
    timezone,
    prospectLocalTime,
    connectionType,
    downlinkSpeed,
    rtt,
    cpuCores,
    deviceMemoryGb,
    pixelRatio,
    screenOrientation,
    utmSource,
    utmMedium,
    utmCampaign,
    referrerDomain,
  };
}

let cachedBattery: { batteryLevel?: string; isCharging?: boolean } = {};
if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
  try {
    (navigator as any).getBattery().then((b: any) => {
      cachedBattery = {
        batteryLevel: `${Math.round(b.level * 100)}%`,
        isCharging: Boolean(b.charging),
      };
      b.addEventListener('levelchange', () => {
        cachedBattery.batteryLevel = `${Math.round(b.level * 100)}%`;
      });
      b.addEventListener('chargingchange', () => {
        cachedBattery.isCharging = Boolean(b.charging);
      });
    }).catch(() => {});
  } catch {}
}

// Session management with 30-minute inactivity refresh
function getSessionId(slug: string): { sessionId: string; isNewVisit: boolean } {
  if (typeof window === 'undefined') return { sessionId: 'server', isNewVisit: false };

  const storageKey = `pitch_session_${slug}`;
  const timestampKey = `pitch_last_active_${slug}`;

  const now = Date.now();
  const lastActive = Number(sessionStorage.getItem(timestampKey)) || 0;
  const isExpired = lastActive > 0 && now - lastActive > 30 * 60 * 1000; // 30 mins

  let sid = sessionStorage.getItem(storageKey);
  let isNew = false;

  if (!sid || isExpired) {
    sid = 'psess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    sessionStorage.setItem(storageKey, sid);
    isNew = true;
  }

  sessionStorage.setItem(timestampKey, String(now));
  return { sessionId: sid, isNewVisit: isNew };
}

// Check if currently viewed by platform admin (to prevent skewing client metrics)
function checkIsAdminPreview(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const hasToken = Boolean(localStorage.getItem('pitchengine_token'));
    const urlParams = new URLSearchParams(window.location.search);
    const hasAdminParam = urlParams.has('preview') || urlParams.has('admin');
    return hasToken || hasAdminParam;
  } catch {
    return false;
  }
}

/**
 * usePitchTracker Hook:
 * Captures link opens instantly, active engagement time, scroll depth,
 * location, device details, and conversion actions for any client pitch.
 */
export function usePitchTracker(slug: string | undefined | null) {
  const activeDurationRef = useRef<number>(0);
  const idleDurationRef = useRef<number>(0);
  const tabSwitchesRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);
  const sectionsViewedRef = useRef<Set<string>>(new Set());
  const sectionEngagementRef = useRef<Record<string, number>>({});
  const clickedButtonsRef = useRef<Array<{ text: string; tag: string; href?: string; timestamp: string }>>([]);
  const rageClicksRef = useRef<Array<{ text: string; count: number; timestamp: string }>>([]);
  const clickStreakRef = useRef<{ text: string; count: number; time: number }>({ text: '', count: 0, time: 0 });
  const hasBacktrackedRef = useRef<boolean>(false);
  const clickedPhoneRef = useRef<boolean>(false);
  const clickedCtaRef = useRef<boolean>(false);
  const submittedFormRef = useRef<boolean>(false);
  const exitIntentRef = useRef<boolean>(false);
  const copiedTextsRef = useRef<string[]>([]);
  const loggedSectionsRef = useRef<Set<string>>(new Set());
  const eventsTimelineRef = useRef<Array<{
    type: 'OPEN' | 'SCROLL' | 'CLICK' | 'COPY' | 'EXIT_INTENT' | 'FORM_SUBMIT' | 'RAGE_CLICK' | 'TAB_SWITCH' | 'BACKTRACK';
    label: string;
    elapsedSeconds: number;
    timestamp: string;
  }>>([]);
  const isTrackingActiveRef = useRef<boolean>(true);
  const lastUserActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!slug || slug === 'platform' || slug === 'admin') return;

    const { sessionId, isNewVisit } = getSessionId(slug);
    const deviceInfo = getDeviceInfo();
    const isAdminPreview = checkIsAdminPreview();
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    let geoData: GeoLocationData = {};

    const sectionDefs = [
      { id: 'hero-section', label: 'Hero' },
      { id: 'about', label: 'About Us' },
      { id: 'services', label: 'Services' },
      { id: 'team', label: 'Team Values' },
      { id: 'how-we-work', label: 'How We Work' },
      { id: 'portfolio', label: 'Portfolio' },
      { id: 'testimonials', label: 'Testimonials' },
      { id: 'quote', label: 'Quote Form' },
      { id: 'contact', label: 'Contact Section' },
      { id: 'faq', label: 'FAQ' },
      { id: 'footer', label: 'Footer' },
    ];

    // Compute proprietary engagement lead score (0-100)
    const computeLeadScore = () => {
      let score = 15;
      const sec = activeDurationRef.current;
      if (sec >= 90) score += 30;
      else if (sec >= 30) score += 18;
      else if (sec >= 10) score += 8;

      const scroll = maxScrollRef.current;
      if (scroll >= 85) score += 25;
      else if (scroll >= 50) score += 15;
      else if (scroll >= 25) score += 8;

      if (clickedCtaRef.current) score += 20;
      if (clickedPhoneRef.current) score += 35;
      if (submittedFormRef.current) score += 45;
      if (copiedTextsRef.current.length > 0) score += 15;
      if (rageClicksRef.current.length > 0) score += 15;
      if (hasBacktrackedRef.current) score += 15;

      score = Math.min(100, score);

      let category: 'HOT' | 'WARM' | 'COLD' | 'BOUNCE' = 'COLD';
      if (score >= 75 || clickedPhoneRef.current || submittedFormRef.current) category = 'HOT';
      else if (score >= 40) category = 'WARM';
      else if (sec < 5 && scroll < 20) category = 'BOUNCE';

      return { score, category };
    };

    // Helper to send tracking ping
    const sendPing = async (isFinal = false) => {
      try {
        const { score, category } = computeLeadScore();
        const extTelemetry = getExtendedTelemetry();

        const payload = {
          slug,
          sessionId,
          isAdminPreview,
          isNewVisit: isFinal ? false : isNewVisit,
          durationSeconds: Math.floor(activeDurationRef.current),
          idleSeconds: Math.floor(idleDurationRef.current),
          tabSwitches: tabSwitchesRef.current,
          scrollDepth: Math.round(maxScrollRef.current),
          sectionsViewed: Array.from(sectionsViewedRef.current),
          sectionEngagement: { ...sectionEngagementRef.current },
          clickedButtons: [...clickedButtonsRef.current],
          rageClicks: [...rageClicksRef.current],
          clickedPhone: clickedPhoneRef.current,
          clickedCta: clickedCtaRef.current,
          submittedForm: submittedFormRef.current,
          exitIntent: exitIntentRef.current,
          copiedTexts: [...copiedTextsRef.current],
          engagementScore: score,
          intentCategory: category,
          eventsTimeline: [...eventsTimelineRef.current].slice(-30),
          referrer,
          ...deviceInfo,
          ...extTelemetry,
          ...cachedBattery,
          ...geoData,
        };

        if (isFinal && typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const endpoint = `${window.location.origin}/api/analytics/track`;
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          navigator.sendBeacon(endpoint, blob);
        } else {
          await trackPitchEvent(payload);
        }
      } catch {}
    };

    // Log initial open in timeline
    eventsTimelineRef.current.push({
      type: 'OPEN',
      label: `Opened pitch via ${referrer ? 'referrer (' + referrer + ')' : 'direct / personalized link'}`,
      elapsedSeconds: 0,
      timestamp: new Date().toISOString(),
    });

    // 1. INSTANT OPEN EVENT (0ms) - Never delayed by network or geo lookups
    sendPing(false);

    // 2. Fetch Geo Location in background, then update session once resolved
    getGeoLocation().then((geo) => {
      if (geo && (geo.ip || geo.city)) {
        geoData = geo;
        sendPing(false);
      }
    });

    // 3. Activity listeners to distinguish active reading from idle
    const recordUserActivity = () => {
      lastUserActivityRef.current = Date.now();
    };
    window.addEventListener('mousemove', recordUserActivity, { passive: true });
    window.addEventListener('keydown', recordUserActivity, { passive: true });
    window.addEventListener('touchstart', recordUserActivity, { passive: true });

    // Active duration & per-section engagement counter
    const durationInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && isTrackingActiveRef.current) {
        const isUserActive = (Date.now() - lastUserActivityRef.current) < 20000;
        if (isUserActive) {
          activeDurationRef.current += 1;
        } else {
          idleDurationRef.current += 1;
        }

        sessionStorage.setItem(`pitch_last_active_${slug}`, String(Date.now()));

        // Identify which section is currently centered on the visitor's screen
        const midY = window.innerHeight * 0.45;
        for (const sec of sectionDefs) {
          const el = document.getElementById(sec.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= midY && rect.bottom >= midY) {
              sectionEngagementRef.current[sec.label] = (sectionEngagementRef.current[sec.label] || 0) + 1;
              sectionsViewedRef.current.add(sec.label);
              break;
            }
          }
        }
      }
    }, 1000);

    // 4. Heartbeat update every 5 seconds to keep live metrics accurate
    const heartbeatInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        sendPing(false);
      }
    }, 5000);

    // 5. Scroll Depth Calculator & Backtrack detector
    const handleScroll = () => {
      recordUserActivity();
      if (typeof window === 'undefined' || typeof document === 'undefined') return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight > 0) {
        const scrollPercent = Math.min(100, Math.max(0, ((scrollTop + winHeight) / docHeight) * 100));
        if (scrollPercent > maxScrollRef.current) {
          maxScrollRef.current = scrollPercent;
        }

        // Backtrack detection: prospect scrolled deep (>50%) then scrolled back up to Hero/Services (<30%)
        if (maxScrollRef.current > 50 && scrollPercent < 30 && !hasBacktrackedRef.current) {
          hasBacktrackedRef.current = true;
          eventsTimelineRef.current.push({
            type: 'BACKTRACK',
            label: 'Backtracked to top sections (Re-evaluating proposal details)',
            elapsedSeconds: Math.floor(activeDurationRef.current),
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Check key section visibility and log timeline
      sectionDefs.forEach(({ id, label }) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
            sectionsViewedRef.current.add(label);
            if (!loggedSectionsRef.current.has(label)) {
              loggedSectionsRef.current.add(label);
              eventsTimelineRef.current.push({
                type: 'SCROLL',
                label: `Scrolled to ${label}`,
                elapsedSeconds: Math.floor(activeDurationRef.current),
                timestamp: new Date().toISOString(),
              });
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 6. Comprehensive Click & Rage-Click Listener
    const handleClick = (e: MouseEvent) => {
      recordUserActivity();
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a') as HTMLAnchorElement | null;
      const button = target.closest('button') as HTMLButtonElement | null;

      if (anchor || button) {
        const el = anchor || button;
        const rawText = (
          el?.innerText ||
          el?.getAttribute('aria-label') ||
          el?.getAttribute('title') ||
          el?.textContent ||
          ''
        ).replace(/\s+/g, ' ').trim();

        let cleanText = rawText.length > 0 ? rawText.slice(0, 60) : '';
        const href = anchor ? anchor.getAttribute('href') || undefined : undefined;

        if (!cleanText) {
          if (anchor && anchor.href && anchor.href.startsWith('tel:')) {
            cleanText = `Call ${anchor.href.replace('tel:', '')}`;
          } else if (anchor && anchor.href && anchor.href.startsWith('mailto:')) {
            cleanText = `Email ${anchor.href.replace('mailto:', '')}`;
          } else if (anchor && anchor.href && anchor.href.includes('#')) {
            cleanText = `Navigate to ${anchor.href.split('#')[1]}`;
          } else {
            cleanText = anchor ? 'Link Tap' : 'Button Tap';
          }
        }

        // Detect Rage Clicks: 3+ clicks within 1200ms on the same element
        const now = Date.now();
        if (clickStreakRef.current.text === cleanText && (now - clickStreakRef.current.time) < 1200) {
          clickStreakRef.current.count += 1;
          clickStreakRef.current.time = now;
          if (clickStreakRef.current.count === 3) {
            const rageEntry = { text: cleanText, count: 3, timestamp: new Date().toISOString() };
            rageClicksRef.current = [...rageClicksRef.current.slice(-19), rageEntry];
            eventsTimelineRef.current.push({
              type: 'RAGE_CLICK',
              label: `Urgent / Rapid multiple clicks on "${cleanText}" (3x)`,
              elapsedSeconds: Math.floor(activeDurationRef.current),
              timestamp: new Date().toISOString(),
            });
          }
        } else {
          clickStreakRef.current = { text: cleanText, count: 1, time: now };
        }

        // Record interaction in clickedButtons array (keep recent 50 clicks)
        clickedButtonsRef.current = [
          ...clickedButtonsRef.current.slice(-49),
          {
            text: cleanText,
            tag: button ? 'BUTTON' : 'A',
            href,
            timestamp: new Date().toISOString(),
          },
        ];

        eventsTimelineRef.current.push({
          type: 'CLICK',
          label: `Tapped "${cleanText}"`,
          elapsedSeconds: Math.floor(activeDurationRef.current),
          timestamp: new Date().toISOString(),
        });

        if (anchor && anchor.href && anchor.href.startsWith('tel:')) {
          clickedPhoneRef.current = true;
        }

        const lowerText = cleanText.toLowerCase();
        if (
          (anchor && anchor.href && (anchor.href.includes('#contact') || anchor.href.includes('#quote') || anchor.classList.contains('cta-btn'))) ||
          lowerText.includes('quote') ||
          lowerText.includes('estimate') ||
          lowerText.includes('call') ||
          lowerText.includes('claim') ||
          lowerText.includes('contact')
        ) {
          clickedCtaRef.current = true;
        }

        // Send instant ping on click
        sendPing(false);
      }
    };

    // 7. Form Submission Listener
    const handleSubmit = () => {
      recordUserActivity();
      submittedFormRef.current = true;
      clickedButtonsRef.current = [
        ...clickedButtonsRef.current.slice(-49),
        {
          text: 'Submitted Quote / Inspection Form',
          tag: 'FORM',
          timestamp: new Date().toISOString(),
        },
      ];
      eventsTimelineRef.current.push({
        type: 'FORM_SUBMIT',
        label: 'Submitted Quote / Inspection Form',
        elapsedSeconds: Math.floor(activeDurationRef.current),
        timestamp: new Date().toISOString(),
      });
      sendPing(false);
    };

    // 8. Copy Text Listener (buying intent indicator)
    const handleCopy = () => {
      recordUserActivity();
      try {
        const selection = (window.getSelection()?.toString() || '').trim();
        if (selection.length > 0) {
          const snippet = selection.slice(0, 80);
          copiedTextsRef.current = [...copiedTextsRef.current.slice(-19), snippet];
          eventsTimelineRef.current.push({
            type: 'COPY',
            label: `Copied text: "${snippet}"`,
            elapsedSeconds: Math.floor(activeDurationRef.current),
            timestamp: new Date().toISOString(),
          });
          sendPing(false);
        }
      } catch {}
    };

    // 9. Exit Intent Listener (Desktop mouse leaves near top tabs)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !exitIntentRef.current) {
        exitIntentRef.current = true;
        eventsTimelineRef.current.push({
          type: 'EXIT_INTENT',
          label: 'Triggered exit intent (moved cursor towards close / tabs)',
          elapsedSeconds: Math.floor(activeDurationRef.current),
          timestamp: new Date().toISOString(),
        });
        sendPing(false);
      }
    };

    document.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('submit', handleSubmit, { capture: true, passive: true });
    document.addEventListener('copy', handleCopy, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // 10. Page Visibility / Tab Switching Listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        eventsTimelineRef.current.push({
          type: 'TAB_SWITCH',
          label: 'Switched away from pitch tab (backgrounded)',
          elapsedSeconds: Math.floor(activeDurationRef.current),
          timestamp: new Date().toISOString(),
        });
        sendPing(true);
      } else if (document.visibilityState === 'visible') {
        tabSwitchesRef.current += 1;
        recordUserActivity();
        eventsTimelineRef.current.push({
          type: 'TAB_SWITCH',
          label: `Returned to pitch tab (focus restored #${tabSwitchesRef.current})`,
          elapsedSeconds: Math.floor(activeDurationRef.current),
          timestamp: new Date().toISOString(),
        });
        sendPing(false);
      }
    };

    const handleBeforeUnload = () => {
      sendPing(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(durationInterval);
      clearInterval(heartbeatInterval);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', recordUserActivity);
      window.removeEventListener('keydown', recordUserActivity);
      window.removeEventListener('touchstart', recordUserActivity);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleSubmit, { capture: true });
      document.removeEventListener('copy', handleCopy);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sendPing(true);
    };
  }, [slug]);
}
