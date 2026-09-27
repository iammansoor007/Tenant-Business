import http from 'http';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB, isDbConnected, AdminModel, TenantModel } from './db';
import completeDataTemplate from '../src/data/completeData.json';

const JWT_SECRET = process.env.JWT_SECRET || 'pitchengine_super_secret_jwt_key_2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin@pitchplatform.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin12345!';

// In-memory fallback if MongoDB is offline
export const fallbackTenants: Map<string, any> = new Map();

// Initialize default template in fallback
fallbackTenants.set('max-quality-roofing', {
  slug: 'max-quality-roofing',
  name: 'Max Quality Roofing',
  status: 'active',
  media: {
    logo: '/logo.webp',
    heroBg: '/assets/newhero.webp',
  },
  colors: {
    primary: '#0B1D33',
    primaryHover: '#12365A',
    secondary: '#344B63',
    accent: '#AEB8C2',
  },
  completeData: completeDataTemplate,
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
  const url = req.url || '';

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

      const uploadData = await uploadRes.json();
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
              { upsert: true, returnDocument: 'after' }
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
        status: data.status || 'active',
        media: data.media || {},
        colors: data.colors || {},
        customCss: data.customCss || '',
        seo: data.seo || {},
        completeData: data.completeData || completeDataTemplate,
        updatedAt: new Date().toISOString(),
      };

      if (isDbConnected) {
        try {
          const saved = await TenantModel.findOneAndUpdate(
            { slug: tenantObj.slug },
            tenantObj,
            { upsert: true, returnDocument: 'after' }
          );
          sendJson(res, 200, { success: true, tenant: saved });
        } catch (dbErr: any) {
          console.warn('MongoDB save error, falling back to in-memory store:', dbErr.message);
          fallbackTenants.set(tenantObj.slug, tenantObj);
          sendJson(res, 200, { success: true, tenant: tenantObj, warning: 'Saved to memory due to database document size limits' });
        }
      } else {
        fallbackTenants.set(tenantObj.slug, tenantObj);
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

    sendJson(res, 404, { success: false, message: 'API route not found' });
    return true;
  } catch (apiErr: any) {
    console.error('API Error:', apiErr);
    sendJson(res, 500, { success: false, message: apiErr.message || 'Internal server error' });
    return true;
  }
}
