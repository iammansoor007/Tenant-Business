import http from 'http';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB, isDbConnected, AdminModel, TenantModel, PitchVisitModel } from './db';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let completeDataTemplate: any = {};
try {
  completeDataTemplate = require('../src/data/completeData.json');
} catch {
  try {
    completeDataTemplate = require('./completeData.json');
  } catch {}
}

const JWT_SECRET = process.env.JWT_SECRET || 'pitchengine_super_secret_jwt_key_2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin@pitchplatform.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin12345!';

// In-memory fallback if MongoDB is offline or in ephemeral serverless environments
export const fallbackTenants: Map<string, any> = new Map();
export const fallbackPitchVisits: Map<string, any[]> = new Map();

// Helper to clone base completeData
function cloneBaseData(overrides: { name: string; phone: string; location: string; tagline?: string }) {
  const d = JSON.parse(JSON.stringify(completeDataTemplate || {}));
  if (d.footer?.contact) {
    d.footer.contact.phone = overrides.phone;
    d.footer.contact.phoneLink = `tel:${overrides.phone.replace(/\D/g, '')}`;
    d.footer.contact.address = overrides.location;
  }
  if (d.hero) {
    if (overrides.tagline) {
      d.hero.headlines = [overrides.tagline, `${overrides.name} in ${overrides.location}`];
    }
  }
  return d;
}

// Initialize flagship and default pitches in fallback
fallbackTenants.set('max-quality-roofing', {
  slug: 'max-quality-roofing',
  name: 'Max Quality Roofing',
  phone: '(406) 217-1720',
  location: 'Great Falls, MT',
  status: 'active',
  media: { logo: '/logo.webp', heroBg: '/assets/newhero.webp' },
  colors: { primary: '#0B1D33', primaryHover: '#12365A', secondary: '#344B63', accent: '#AEB8C2' },
  completeData: completeDataTemplate,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

fallbackTenants.set('a1-hvac', {
  slug: 'a1-hvac',
  name: 'a1 hvac',
  phone: '+13147578637',
  location: 'St. Louis, Missouri',
  status: 'active',
  media: { logo: '/logo.webp', heroBg: '/assets/newhero.webp' },
  colors: { primary: '#0F4C81', primaryHover: '#0A3358', secondary: '#2C3E50', accent: '#D4AF37' },
  completeData: cloneBaseData({ name: 'a1 hvac', phone: '+13147578637', location: 'St. Louis, Missouri', tagline: 'Premier HVAC & Climate Comfort' }),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

fallbackTenants.set('a1-hvac-copy', {
  slug: 'a1-hvac-copy',
  name: 'a1 hvac (Copy)',
  phone: '+13147578637',
  location: 'St. Louis, Missouri',
  status: 'draft',
  media: { logo: '/logo.webp', heroBg: '/assets/newhero.webp' },
  colors: { primary: '#0F4C81', primaryHover: '#0A3358', secondary: '#2C3E50', accent: '#D4AF37' },
  completeData: cloneBaseData({ name: 'a1 hvac (Copy)', phone: '+13147578637', location: 'St. Louis, Missouri', tagline: 'Premier HVAC & Climate Comfort' }),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

fallbackTenants.set('tnb-junk-removal', {
  slug: 'tnb-junk-removal',
  name: 'TNB Junk Removal',
  phone: '(615) 601-2244',
  location: 'Nashville, TN',
  status: 'active',
  media: { logo: '/logo.webp', heroBg: '/assets/newhero.webp' },
  colors: { primary: '#0D5C3A', primaryHover: '#083D26', secondary: '#1F2937', accent: '#F59E0B' },
  completeData: cloneBaseData({ name: 'TNB Junk Removal', phone: '(615) 601-2244', location: 'Nashville, TN', tagline: 'Fast, Dependable Residential & Commercial Junk Removal' }),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

fallbackTenants.set('come-and-take-it-junk-removal', {
  slug: 'come-and-take-it-junk-removal',
  name: 'Come and Take It Junk Removal',
  phone: '(512) 898-7722',
  location: 'Austin, TX',
  status: 'active',
  media: { logo: '/logo.webp', heroBg: '/assets/newhero.webp' },
  colors: { primary: '#8B1E1E', primaryHover: '#631313', secondary: '#1E293B', accent: '#EAB308' },
  completeData: cloneBaseData({ name: 'Come and Take It Junk Removal', phone: '(512) 898-7722', location: 'Austin, TX', tagline: 'Texas-Tough Junk Hauling, Cleanouts & Light Demolition' }),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export async function getTenantBySlug(slug: string): Promise<any | null> {
  const cleanSlug = slug.toLowerCase().trim();
  if (isDbConnected) {
    try {
      const tenant = await TenantModel.findOne({ slug: cleanSlug });
      if (tenant) return tenant.toObject ? tenant.toObject() : tenant;
    } catch (e) {
      // quiet fallback
    }
  }
  return fallbackTenants.get(cleanSlug) || null;
}

// Helper to read JSON request body
function parseRequestBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // 50MB max body limit for base64 images
      if (body.length > 50 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Helper to send JSON responses
function sendJson(res: http.ServerResponse, status: number, data: any) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

export async function handleApiRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<boolean> {
  const reqAny = req as any;
  const rawUrl =
    (req.headers && ((req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-uri'] as string))) ||
    reqAny.originalUrl ||
    req.url ||
    '';
  let url = rawUrl.split('?')[0] || '';
  if ((url === '/api' || url === '/api/') && reqAny.query) {
    const slug = reqAny.query.slug || reqAny.query.path;
    if (slug) {
      url = `/api/${Array.isArray(slug) ? slug.join('/') : slug}`;
    }
  }

  // Only handle /api/ routes
  if (!url.startsWith('/api')) {
    return false;
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return true;
  }

  // Ensure DB connection attempted once
  await connectDB();

  try {
    // ─── 0. CLOUDINARY UPLOAD: POST /api/upload ───
    if (url === '/api/upload' && req.method === 'POST') {
      const { file, folder = 'mercurial_roofing' } = await parseRequestBody(req);
      if (!file) {
        sendJson(res, 400, { success: false, message: 'No image file provided' });
        return true;
      }

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        sendJson(res, 400, { success: false, message: 'Cloudinary credentials missing in environment' });
        return true;
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file,
          api_key: apiKey,
          timestamp,
          folder,
          signature,
        }),
      });

      const uploadData: any = await uploadRes.json();
      if (uploadData.secure_url) {
        sendJson(res, 200, {
          success: true,
          url: uploadData.secure_url,
          public_id: uploadData.public_id,
        });
      } else {
        sendJson(res, 400, {
          success: false,
          message: uploadData.error?.message || 'Cloudinary upload failed',
        });
      }
      return true;
    }

    // ─── 1. AUTH: POST /api/auth/login ───
    if (url === '/api/auth/login' && req.method === 'POST') {
      const { username, password } = await parseRequestBody(req);

      // Check default seeded credentials directly
      let isValid = (
        (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) ||
        (username === 'admin@pitchplatform.com' && password === 'admin12345!') ||
        (username === 'admin@yourdomain.com' && password === 'YourStrongPassword!')
      );

      // Or check MongoDB if connected
      if (!isValid && isDbConnected) {
        const admin = await AdminModel.findOne({ username });
        if (admin) {
          isValid = await bcrypt.compare(password, admin.passwordHash);
        }
      }

      if (!isValid) {
        sendJson(res, 401, { success: false, message: 'Invalid admin credentials' });
        return true;
      }

      const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      sendJson(res, 200, {
        success: true,
        token,
        user: { username, role: 'admin' },
        isDbConnected,
      });
      return true;
    }

    // ─── 2. STATUS: GET /api/status ───
    if (url === '/api/status' && req.method === 'GET') {
      sendJson(res, 200, {
        status: 'online',
        database: isDbConnected ? 'MongoDB connected' : 'Local memory mode',
        cloudinary: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
        time: new Date().toISOString(),
      });
      return true;
    }

    // ─── 3. GET ALL TENANTS: GET /api/tenants ───
    if (url === '/api/tenants' && req.method === 'GET') {
      if (isDbConnected) {
        const tenants = await TenantModel.find({}).sort({ updatedAt: -1 });
        sendJson(res, 200, { success: true, tenants, source: 'mongodb' });
      } else {
        const tenants = Array.from(fallbackTenants.values());
        sendJson(res, 200, { success: true, tenants, source: 'local' });
      }
      return true;
    }

    // ─── 4. BULK CREATE TENANTS: POST /api/tenants/bulk ───
    if (url === '/api/tenants/bulk' && req.method === 'POST') {
      const body = await parseRequestBody(req);
      const items: any[] = Array.isArray(body) ? body : body.tenants || [];

      if (!items || items.length === 0) {
        sendJson(res, 400, { success: false, message: 'No client items provided in JSON array' });
        return true;
      }

      const created: any[] = [];

      for (const item of items) {
        if (!item.slug || !item.name) continue;

        const location = item.location || (item.city && item.state ? `${item.city}, ${item.state}` : item.city || item.state || '');
        const tenantData = {
          slug: item.slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-'),
          name: item.name,
          phone: item.phone || '',
          email: item.email || '',
          location,
          customDomain: item.customDomain ? item.customDomain.toLowerCase().trim() : '',
          status: item.status || 'active',
          media: item.media || {},
          colors: item.colors || {},
          customCss: item.customCss || '',
          seo: item.seo || {},
          completeData: item.completeData || completeDataTemplate,
          updatedAt: new Date(),
        };

        if (isDbConnected) {
          try {
            await TenantModel.findOneAndUpdate(
              { slug: tenantData.slug },
              tenantData,
              { upsert: true, new: true }
            );
          } catch (dbErr: any) {
            console.warn(`MongoDB bulk save failed for ${tenantData.slug}, saved to local fallback:`, dbErr.message);
            fallbackTenants.set(tenantData.slug, tenantData);
          }
        } else {
          fallbackTenants.set(tenantData.slug, tenantData);
        }
        created.push(tenantData.slug);
      }

      sendJson(res, 200, {
        success: true,
        message: `Successfully created/updated ${created.length} clients!`,
        count: created.length,
        slugs: created,
      });
      return true;
    }

    // ─── 5. GET SINGLE TENANT: GET /api/tenants/:slug ───
    if (url.startsWith('/api/tenants/') && req.method === 'GET') {
      const slug = url.replace('/api/tenants/', '').split('?')[0].trim().toLowerCase();

      if (isDbConnected) {
        const tenant = await TenantModel.findOne({ slug });
        if (tenant) {
          sendJson(res, 200, { success: true, tenant });
          return true;
        }
      }

      // Check fallback
      if (fallbackTenants.has(slug)) {
        sendJson(res, 200, { success: true, tenant: fallbackTenants.get(slug) });
        return true;
      }

      sendJson(res, 404, { success: false, message: `Client '${slug}' not found` });
      return true;
    }

    // ─── 6. CREATE / UPDATE SINGLE TENANT: POST /api/tenants ───
    if (url === '/api/tenants' && req.method === 'POST') {
      const data = await parseRequestBody(req);

      if (!data.slug || !data.name) {
        sendJson(res, 400, { success: false, message: 'Slug and Name are required' });
        return true;
      }

      const tenantObj = {
        slug: data.slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-'),
        name: data.name,
        phone: data.phone || '',
        email: data.email || '',
        location: data.location || '',
        customDomain: data.customDomain ? data.customDomain.toLowerCase().trim() : '',
        status: data.status || 'active',
        media: data.media || {},
        colors: data.colors || {},
        customCss: data.customCss || '',
        seo: data.seo || {},
        completeData: data.completeData || completeDataTemplate,
        updatedAt: new Date().toISOString(),
      };

      // Always update in-memory fallback cache immediately
      fallbackTenants.set(tenantObj.slug, tenantObj);

      if (isDbConnected) {
        try {
          const saved = await TenantModel.findOneAndUpdate(
            { slug: tenantObj.slug },
            tenantObj,
            { upsert: true, new: true }
          );
          sendJson(res, 200, { success: true, tenant: saved || tenantObj });
        } catch (dbErr: any) {
          console.warn('MongoDB save error, falling back to in-memory store:', dbErr.message);
          sendJson(res, 200, { success: true, tenant: tenantObj, warning: 'Saved to memory due to database document size limits' });
        }
      } else {
        sendJson(res, 200, { success: true, tenant: tenantObj });
      }
      return true;
    }

    // ─── 7. DELETE TENANT: DELETE /api/tenants/:slug ───
    if (url.startsWith('/api/tenants/') && req.method === 'DELETE') {
      const slug = url.replace('/api/tenants/', '').split('?')[0].trim().toLowerCase();

      if (isDbConnected) {
        await TenantModel.deleteOne({ slug });
      }
      fallbackTenants.delete(slug);

      sendJson(res, 200, { success: true, message: `Client '${slug}' deleted successfully` });
      return true;
    }

    // ─── 8. BULK DELETE TENANTS: POST /api/tenants/bulk-delete ───
    if (url === '/api/tenants/bulk-delete' && req.method === 'POST') {
      const { slugs } = await parseRequestBody(req);
      if (Array.isArray(slugs) && slugs.length > 0) {
        if (isDbConnected) {
          try {
            await TenantModel.deleteMany({ slug: { $in: slugs } });
          } catch (e: any) {
            console.warn('MongoDB bulk-delete error:', e.message);
          }
        }
        for (const s of slugs) {
          fallbackTenants.delete(s);
        }
      }
      sendJson(res, 200, { success: true, message: `Deleted ${slugs?.length || 0} clients successfully` });
      return true;
    }

    // ─── 9. BULK UPDATE STATUS: POST /api/tenants/bulk-status ───
    if (url === '/api/tenants/bulk-status' && req.method === 'POST') {
      const { slugs, status } = await parseRequestBody(req);
      if (Array.isArray(slugs) && slugs.length > 0 && status) {
        if (isDbConnected) {
          try {
            await TenantModel.updateMany({ slug: { $in: slugs } }, { $set: { status, updatedAt: new Date().toISOString() } });
          } catch (e: any) {
            console.warn('MongoDB bulk-status error:', e.message);
          }
        }
        for (const s of slugs) {
          const t = fallbackTenants.get(s);
          if (t) {
            t.status = status;
            t.updatedAt = new Date().toISOString();
          }
        }
      }
      sendJson(res, 200, { success: true, message: `Updated status for ${slugs?.length || 0} clients` });
      return true;
    }

    // ─── 10. TRACK PITCH EVENT: POST /api/analytics/track ───
    if (url === '/api/analytics/track' && req.method === 'POST') {
      const data = await parseRequestBody(req);
      const slug = (data.slug || '').toLowerCase().trim();
      const sessionId = data.sessionId || 'anon-' + Date.now();

      if (!slug) {
        sendJson(res, 400, { success: false, message: 'Missing slug' });
        return true;
      }

      // Extract client IP with Cloudflare, proxy, and socket support
      const cfIp = req.headers['cf-connecting-ip'];
      const realIp = req.headers['x-real-ip'];
      const forwarded = req.headers['x-forwarded-for'];
      const headerIp =
        (typeof cfIp === 'string' && cfIp.trim()) ||
        (typeof realIp === 'string' && realIp.trim()) ||
        (typeof forwarded === 'string' && forwarded.split(',')[0].trim()) ||
        req.socket.remoteAddress ||
        '';
      const isLoopback = !data.ip || data.ip === '127.0.0.1' || data.ip === '::1' || data.ip.includes('localhost');
      const effectiveIp = isLoopback ? (headerIp || 'Direct Network') : data.ip;

      const incomingDuration = Number(data.durationSeconds) || 0;
      const incomingScroll = Number(data.scrollDepth) || 0;
      const incomingSections = Array.isArray(data.sectionsViewed) ? data.sectionsViewed : [];
      const incomingEngagement = (typeof data.sectionEngagement === 'object' && data.sectionEngagement) ? data.sectionEngagement : {};
      const incomingButtons = Array.isArray(data.clickedButtons) ? data.clickedButtons : [];
      const incomingRageClicks = Array.isArray(data.rageClicks) ? data.rageClicks : [];
      const incomingCopied = Array.isArray(data.copiedTexts) ? data.copiedTexts : [];
      const incomingTimeline = Array.isArray(data.eventsTimeline) ? data.eventsTimeline : [];
      const incomingScore = Number(data.engagementScore) || 0;
      const incomingCategory = data.intentCategory || 'COLD';

      const visitPayload = {
        slug,
        sessionId,
        isAdminPreview: Boolean(data.isAdminPreview),
        ip: effectiveIp,
        city: data.city || '',
        region: data.region || '',
        country: data.country || '',
        org: data.org || '',
        deviceType: data.deviceType || 'Desktop',
        deviceModel: data.deviceModel || '',
        browser: data.browser || '',
        os: data.os || '',
        screen: data.screen || '',
        language: data.language || '',
        referrer: data.referrer || '',
        referrerDomain: data.referrerDomain || '',
        timezone: data.timezone || '',
        prospectLocalTime: data.prospectLocalTime || '',
        connectionType: data.connectionType || '',
        downlinkSpeed: data.downlinkSpeed || '',
        rtt: data.rtt || '',
        batteryLevel: data.batteryLevel || '',
        isCharging: Boolean(data.isCharging),
        cpuCores: Number(data.cpuCores) || 0,
        deviceMemoryGb: Number(data.deviceMemoryGb) || 0,
        pixelRatio: data.pixelRatio || '',
        screenOrientation: data.screenOrientation || '',
        tabSwitches: Number(data.tabSwitches) || 0,
        idleSeconds: Number(data.idleSeconds) || 0,
        utmSource: data.utmSource || '',
        utmMedium: data.utmMedium || '',
        utmCampaign: data.utmCampaign || '',
        lastSeen: new Date(),
        durationSeconds: incomingDuration,
        scrollDepth: incomingScroll,
        sectionsViewed: incomingSections,
        sectionEngagement: incomingEngagement,
        clickedButtons: incomingButtons,
        rageClicks: incomingRageClicks,
        exitIntent: Boolean(data.exitIntent),
        copiedTexts: incomingCopied,
        engagementScore: incomingScore,
        intentCategory: incomingCategory,
        eventsTimeline: incomingTimeline,
        clickedPhone: Boolean(data.clickedPhone),
        clickedCta: Boolean(data.clickedCta),
        submittedForm: Boolean(data.submittedForm),
      };

      // 1) Update In-Memory fallback store
      let slugVisits = fallbackPitchVisits.get(slug) || [];
      const existingIdx = slugVisits.findIndex(v => v.sessionId === sessionId);
      if (existingIdx >= 0) {
        const prev = slugVisits[existingIdx];
        const mergedSections = Array.from(new Set([...(prev.sectionsViewed || []), ...incomingSections]));
        const mergedEngagement = { ...(prev.sectionEngagement || {}) };
        Object.entries(incomingEngagement).forEach(([sec, secTime]: [string, any]) => {
          mergedEngagement[sec] = Math.max(mergedEngagement[sec] || 0, Number(secTime) || 0);
        });

        const mergedButtons = [...(prev.clickedButtons || [])];
        for (const b of incomingButtons) {
          if (!mergedButtons.some(ex => ex.timestamp === b.timestamp && ex.text === b.text)) {
            mergedButtons.push(b);
          }
        }

        const mergedRageClicks = [...(prev.rageClicks || [])];
        for (const r of incomingRageClicks) {
          if (!mergedRageClicks.some(ex => ex.timestamp === r.timestamp && ex.text === r.text)) {
            mergedRageClicks.push(r);
          }
        }

        const mergedCopied = Array.from(new Set([...(prev.copiedTexts || []), ...incomingCopied]));
        const mergedTimeline = [...(prev.eventsTimeline || []), ...incomingTimeline].slice(-50);

        slugVisits[existingIdx] = {
          ...prev,
          ...visitPayload,
          ip: effectiveIp || prev.ip,
          city: data.city || prev.city,
          region: data.region || prev.region,
          country: data.country || prev.country,
          org: data.org || prev.org,
          firstSeen: prev.firstSeen || new Date(),
          durationSeconds: Math.max(prev.durationSeconds || 0, incomingDuration),
          scrollDepth: Math.max(prev.scrollDepth || 0, incomingScroll),
          tabSwitches: Math.max(prev.tabSwitches || 0, Number(data.tabSwitches) || 0),
          idleSeconds: Math.max(prev.idleSeconds || 0, Number(data.idleSeconds) || 0),
          sectionsViewed: mergedSections,
          sectionEngagement: mergedEngagement,
          clickedButtons: mergedButtons,
          rageClicks: mergedRageClicks,
          exitIntent: prev.exitIntent || Boolean(data.exitIntent),
          copiedTexts: mergedCopied,
          engagementScore: Math.max(prev.engagementScore || 0, incomingScore),
          intentCategory: (incomingCategory === 'HOT' || prev.intentCategory === 'HOT') ? 'HOT' : (incomingCategory === 'WARM' || prev.intentCategory === 'WARM') ? 'WARM' : incomingCategory,
          eventsTimeline: mergedTimeline,
          clickedPhone: prev.clickedPhone || Boolean(data.clickedPhone),
          clickedCta: prev.clickedCta || Boolean(data.clickedCta),
          submittedForm: prev.submittedForm || Boolean(data.submittedForm),
          visitCount: (prev.visitCount || 1) + (data.isNewVisit ? 1 : 0),
        };
      } else {
        slugVisits.unshift({
          ...visitPayload,
          firstSeen: new Date(),
          visitCount: 1,
        });
      }
      fallbackPitchVisits.set(slug, slugVisits);

      // 2) Update MongoDB if available
      if (isDbConnected) {
        try {
          const existingDb = await PitchVisitModel.findOne({ slug, sessionId });
          if (existingDb) {
            const mergedSections = Array.from(new Set([...(existingDb.sectionsViewed || []), ...incomingSections]));
            const mergedEngagement = { ...(existingDb.sectionEngagement || {}) };
            Object.entries(incomingEngagement).forEach(([sec, secTime]: [string, any]) => {
              mergedEngagement[sec] = Math.max(mergedEngagement[sec] || 0, Number(secTime) || 0);
            });

            const mergedButtons = [...(existingDb.clickedButtons || [])];
            for (const b of incomingButtons) {
              if (!mergedButtons.some((ex: any) => ex.timestamp === b.timestamp && ex.text === b.text)) {
                mergedButtons.push(b);
              }
            }

            const mergedRageClicks = [...(existingDb.rageClicks || [])];
            for (const r of incomingRageClicks) {
              if (!mergedRageClicks.some((ex: any) => ex.timestamp === r.timestamp && ex.text === r.text)) {
                mergedRageClicks.push(r);
              }
            }

            const mergedCopied = Array.from(new Set([...(existingDb.copiedTexts || []), ...incomingCopied]));
            const mergedTimeline = [...(existingDb.eventsTimeline || []), ...incomingTimeline].slice(-50);

            existingDb.durationSeconds = Math.max(existingDb.durationSeconds || 0, incomingDuration);
            existingDb.scrollDepth = Math.max(existingDb.scrollDepth || 0, incomingScroll);
            existingDb.tabSwitches = Math.max(existingDb.tabSwitches || 0, Number(data.tabSwitches) || 0);
            existingDb.idleSeconds = Math.max(existingDb.idleSeconds || 0, Number(data.idleSeconds) || 0);
            existingDb.sectionsViewed = mergedSections;
            existingDb.sectionEngagement = mergedEngagement;
            existingDb.clickedButtons = mergedButtons;
            existingDb.rageClicks = mergedRageClicks;
            existingDb.exitIntent = existingDb.exitIntent || Boolean(data.exitIntent);
            existingDb.copiedTexts = mergedCopied;
            existingDb.engagementScore = Math.max(existingDb.engagementScore || 0, incomingScore);
            existingDb.intentCategory = (incomingCategory === 'HOT' || existingDb.intentCategory === 'HOT') ? 'HOT' : (incomingCategory === 'WARM' || existingDb.intentCategory === 'WARM') ? 'WARM' : incomingCategory;
            existingDb.eventsTimeline = mergedTimeline;

            existingDb.markModified('sectionEngagement');
            existingDb.markModified('clickedButtons');
            existingDb.markModified('rageClicks');
            existingDb.markModified('sectionsViewed');
            existingDb.markModified('copiedTexts');
            existingDb.markModified('eventsTimeline');

            if (effectiveIp) existingDb.ip = effectiveIp;
            if (data.city) existingDb.city = data.city;
            if (data.region) existingDb.region = data.region;
            if (data.country) existingDb.country = data.country;
            if (data.org) existingDb.org = data.org;
            if (data.deviceType) existingDb.deviceType = data.deviceType;
            if (data.deviceModel) existingDb.deviceModel = data.deviceModel;
            if (data.browser) existingDb.browser = data.browser;
            if (data.os) existingDb.os = data.os;
            if (data.timezone) existingDb.timezone = data.timezone;
            if (data.prospectLocalTime) existingDb.prospectLocalTime = data.prospectLocalTime;
            if (data.connectionType) existingDb.connectionType = data.connectionType;
            if (data.downlinkSpeed) existingDb.downlinkSpeed = data.downlinkSpeed;
            if (data.rtt) existingDb.rtt = data.rtt;
            if (data.batteryLevel) existingDb.batteryLevel = data.batteryLevel;
            if (typeof data.isCharging === 'boolean') existingDb.isCharging = data.isCharging;
            if (data.cpuCores) existingDb.cpuCores = Number(data.cpuCores);
            if (data.deviceMemoryGb) existingDb.deviceMemoryGb = Number(data.deviceMemoryGb);
            if (data.pixelRatio) existingDb.pixelRatio = data.pixelRatio;
            if (data.screenOrientation) existingDb.screenOrientation = data.screenOrientation;
            if (data.referrerDomain) existingDb.referrerDomain = data.referrerDomain;
            if (data.utmSource) existingDb.utmSource = data.utmSource;
            if (data.utmMedium) existingDb.utmMedium = data.utmMedium;
            if (data.utmCampaign) existingDb.utmCampaign = data.utmCampaign;
            if (data.clickedPhone) existingDb.clickedPhone = true;
            if (data.clickedCta) existingDb.clickedCta = true;
            if (data.submittedForm) existingDb.submittedForm = true;
            if (data.isNewVisit) existingDb.visitCount = (existingDb.visitCount || 1) + 1;
            existingDb.lastSeen = new Date();
            await existingDb.save();
          } else {
            await PitchVisitModel.create({
              ...visitPayload,
              firstSeen: new Date(),
              visitCount: 1,
            });
          }
        } catch (dbErr: any) {
          console.warn('MongoDB analytics track error:', dbErr.message);
        }
      }

      sendJson(res, 200, { success: true, message: 'Tracked' });
      return true;
    }

    // ─── 11. GET ANALYTICS SUMMARY: GET /api/analytics/summary ───
    if (url === '/api/analytics/summary' && req.method === 'GET') {
      const summaryMap: Record<string, any> = {};

      if (isDbConnected) {
        try {
          const allVisits = await PitchVisitModel.find({}).sort({ lastSeen: -1 });
          allVisits.forEach((v: any) => {
            const item = v.toObject ? v.toObject() : v;
            const s = item.slug;
            if (!summaryMap[s]) {
              summaryMap[s] = {
                slug: s,
                isOpened: true,
                isLiveNow: false,
                totalVisits: 0,
                uniqueSessions: 0,
                totalDurationSeconds: 0,
                maxScrollDepth: 0,
                firstOpenedAt: item.firstSeen,
                lastOpenedAt: item.lastSeen,
                latestLocation: [item.city, item.region, item.country].filter(Boolean).join(', ') || 'Unknown Location',
                latestDevice: `${item.deviceModel || item.deviceType} (${item.os || 'Unknown OS'})`,
                latestBrowser: item.browser || 'Unknown Browser',
                latestIp: item.ip || '',
                latestOrg: item.org || '',
                latestTimezone: item.timezone || '',
                latestConnection: [item.connectionType, item.downlinkSpeed].filter(Boolean).join(' • '),
                latestBattery: item.batteryLevel ? `${item.batteryLevel}${item.isCharging ? ' ⚡' : ''}` : '',
                engagementScore: 0,
                intentCategory: 'COLD',
                clickedPhone: false,
                clickedCta: false,
                submittedForm: false,
                rageClicksCount: 0,
                visits: [],
              };
            }
            const agg = summaryMap[s];
            agg.totalVisits += (item.visitCount || 1);
            agg.uniqueSessions += 1;
            agg.totalDurationSeconds += (item.durationSeconds || 0);
            agg.maxScrollDepth = Math.max(agg.maxScrollDepth, item.scrollDepth || 0);
            agg.engagementScore = Math.max(agg.engagementScore || 0, item.engagementScore || 0);
            agg.rageClicksCount = (agg.rageClicksCount || 0) + (item.rageClicks?.length || 0);

            if (item.intentCategory === 'HOT' || agg.intentCategory === 'HOT') agg.intentCategory = 'HOT';
            else if (item.intentCategory === 'WARM' || agg.intentCategory === 'WARM') agg.intentCategory = 'WARM';

            if (new Date(item.lastSeen) > new Date(agg.lastOpenedAt)) {
              agg.lastOpenedAt = item.lastSeen;
              agg.latestLocation = [item.city, item.region, item.country].filter(Boolean).join(', ') || agg.latestLocation;
              agg.latestDevice = `${item.deviceModel || item.deviceType} (${item.os || 'Unknown OS'})`;
              agg.latestBrowser = item.browser || agg.latestBrowser;
              agg.latestIp = item.ip || agg.latestIp;
              agg.latestOrg = item.org || agg.latestOrg;
              if (item.timezone) agg.latestTimezone = item.timezone;
              if (item.connectionType) agg.latestConnection = [item.connectionType, item.downlinkSpeed].filter(Boolean).join(' • ');
              if (item.batteryLevel) agg.latestBattery = `${item.batteryLevel}${item.isCharging ? ' ⚡' : ''}`;
            }

            agg.isLiveNow = (Date.now() - new Date(agg.lastOpenedAt).getTime()) < 45000;

            if (item.clickedPhone) agg.clickedPhone = true;
            if (item.clickedCta) agg.clickedCta = true;
            if (item.submittedForm) agg.submittedForm = true;
            agg.visits.push(item);
          });
        } catch (dbErr: any) {
          console.warn('MongoDB analytics summary error:', dbErr.message);
        }
      }

      // Merge / fallback from in-memory store
      fallbackPitchVisits.forEach((visits, s) => {
        if (!summaryMap[s] && visits.length > 0) {
          const latest = visits[0];
          summaryMap[s] = {
            slug: s,
            isOpened: true,
            totalVisits: visits.reduce((acc, v) => acc + (v.visitCount || 1), 0),
            uniqueSessions: visits.length,
            totalDurationSeconds: visits.reduce((acc, v) => acc + (v.durationSeconds || 0), 0),
            maxScrollDepth: visits.reduce((acc, v) => Math.max(acc, v.scrollDepth || 0), 0),
            firstOpenedAt: latest.firstSeen,
            lastOpenedAt: latest.lastSeen,
            latestLocation: [latest.city, latest.region, latest.country].filter(Boolean).join(', ') || 'Unknown Location',
            latestDevice: `${latest.deviceModel || latest.deviceType} (${latest.os || 'Unknown OS'})`,
            latestBrowser: latest.browser || 'Unknown Browser',
            latestIp: latest.ip || '',
            latestOrg: latest.org || '',
            latestTimezone: latest.timezone || '',
            latestConnection: [latest.connectionType, latest.downlinkSpeed].filter(Boolean).join(' • '),
            latestBattery: latest.batteryLevel ? `${latest.batteryLevel}${latest.isCharging ? ' ⚡' : ''}` : '',
            isLiveNow: (Date.now() - new Date(latest.lastSeen).getTime()) < 45000,
            engagementScore: visits.reduce((acc, v) => Math.max(acc, v.engagementScore || 0), 0),
            intentCategory: visits.some(v => v.intentCategory === 'HOT') ? 'HOT' : visits.some(v => v.intentCategory === 'WARM') ? 'WARM' : 'COLD',
            clickedPhone: visits.some(v => v.clickedPhone),
            clickedCta: visits.some(v => v.clickedCta),
            submittedForm: visits.some(v => v.submittedForm),
            rageClicksCount: visits.reduce((acc, v) => acc + (v.rageClicks?.length || 0), 0),
            visits,
          };
        }
      });

      sendJson(res, 200, { success: true, summary: summaryMap });
      return true;
    }

    // ─── 12. GET DETAILED CLIENT ANALYTICS: GET /api/analytics/client/:slug ───
    if (url.startsWith('/api/analytics/client/') && req.method === 'GET') {
      const slug = url.replace('/api/analytics/client/', '').split('?')[0].trim().toLowerCase();
      let visits: any[] = [];

      if (isDbConnected) {
        try {
          visits = await PitchVisitModel.find({ slug }).sort({ lastSeen: -1 });
        } catch (dbErr: any) {
          console.warn('MongoDB fetch client visits error:', dbErr.message);
        }
      }

      if (visits.length === 0) {
        visits = fallbackPitchVisits.get(slug) || [];
      }

      sendJson(res, 200, { success: true, slug, visits });
      return true;
    }

    // ─── 13. CLEAR CLIENT ANALYTICS: DELETE /api/analytics/client/:slug ───
    if (url.startsWith('/api/analytics/client/') && req.method === 'DELETE') {
      const slug = url.replace('/api/analytics/client/', '').split('?')[0].trim().toLowerCase();
      if (isDbConnected) {
        try {
          await PitchVisitModel.deleteMany({ slug });
        } catch {}
      }
      fallbackPitchVisits.delete(slug);
      sendJson(res, 200, { success: true, message: `Analytics cleared for ${slug}` });
      return true;
    }

    sendJson(res, 404, { success: false, message: 'API route not found' });
    return true;
  } catch (apiErr: any) {
    console.error('API Error:', apiErr);
    sendJson(res, 500, { success: false, message: apiErr.message || 'Internal server error' });
    return true;
  }
}
