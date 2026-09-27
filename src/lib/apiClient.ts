import { Tenant, BulkTenantItem } from '../types/tenant';
import baselineCompleteData from '../src/data/completeData.json';

const IDB_NAME = 'PitchEngineDB';
const IDB_STORE = 'tenants';

// ─── INDEXEDDB FALLBACK HELPER ───
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'slug' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet(slug: string): Promise<Tenant | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(slug);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function idbGetAll(): Promise<Tenant[]> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

async function idbPut(tenant: Tenant): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(tenant);
  } catch (err) {
    console.warn('IDB put error:', err);
  }
}

async function idbDelete(slug: string): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(slug);
  } catch (err) {
    console.warn('IDB delete error:', err);
  }
}

// ─── AUTH TOKEN HELPERS ───
const TOKEN_KEY = 'pitchengine_token';
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── API CLIENT METHODS ───
export async function apiLogin(username: string, password: string): Promise<{ success: boolean; token?: string; message?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      setAuthToken(data.token);
    }
    return data;
  } catch {
    // If backend endpoint unreachable, test against default seeded credentials
    if (username === 'admin@pitchplatform.com' && password === 'admin12345!') {
      const fallbackToken = 'offline_seeded_admin_token';
      setAuthToken(fallbackToken);
      return { success: true, token: fallbackToken };
    }
    return { success: false, message: 'Could not connect to authentication service' };
  }
}

export async function fetchAllTenants(): Promise<Tenant[]> {
  try {
    const res = await fetch('/api/tenants');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.tenants)) {
        // Cache to IDB
        for (const t of data.tenants) {
          await idbPut(t);
        }
        return data.tenants;
      }
    }
  } catch (err) {
    console.warn('API fetchAllTenants failed, falling back to IDB:', err);
  }

  // Fallback to IDB
  const localList = await idbGetAll();
  if (localList.length === 0) {
    // Ensure default flagship tenant exists
    const defaultTenant: Tenant = {
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
      completeData: baselineCompleteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await idbPut(defaultTenant);
    return [defaultTenant];
  }
  return localList;
}

export async function fetchTenantBySlug(slug: string): Promise<Tenant | null> {
  const cleanSlug = slug.toLowerCase().trim();

  // Try API first
  try {
    const res = await fetch(`/api/tenants/${cleanSlug}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.tenant) {
        await idbPut(data.tenant);
        return data.tenant;
      }
    }
  } catch (err) {
    console.warn('API fetchTenantBySlug failed, falling back to IDB:', err);
  }

  // Fallback to IDB
  const cached = await idbGet(cleanSlug);
  if (cached) return cached;

  // If asking for default/flagship
  if (cleanSlug === 'max-quality-roofing' || cleanSlug === 'default') {
    return {
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
      completeData: baselineCompleteData,
    };
  }

  return null;
}

export async function saveTenant(tenant: Tenant): Promise<{ success: boolean; tenant?: Tenant; message?: string }> {
  // Always update IDB first
  await idbPut(tenant);

  // Try sending to MongoDB backend
  try {
    const res = await fetch('/api/tenants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken() || ''}`,
      },
      body: JSON.stringify(tenant),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err: any) {
    console.warn('API saveTenant failed, saved to local IDB store:', err.message);
  }

  return { success: true, tenant, message: 'Saved to local database' };
}

export async function bulkCreateTenants(items: BulkTenantItem[]): Promise<{ success: boolean; count?: number; message?: string }> {
  // Save to IDB immediately
  let savedCount = 0;
  for (const item of items) {
    if (!item.slug || !item.name) continue;
    const cleanSlug = item.slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    const fullTenant: Tenant = {
      slug: cleanSlug,
      name: item.name,
      phone: item.phone || '',
      email: item.email || '',
      location: (item.city && item.state ? `${item.city}, ${item.state}` : item.city || item.state || ''),
      status: 'active',
      colors: item.colors || {
        primary: '#0B1D33',
        primaryHover: '#12365A',
        secondary: '#344B63',
        accent: '#AEB8C2',
      },
      media: item.media || {},
      customCss: item.customCss || '',
      seo: item.seo || {},
      completeData: item.completeData || baselineCompleteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await idbPut(fullTenant);
    savedCount++;
  }

  // Try API
  try {
    const res = await fetch('/api/tenants/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken() || ''}`,
      },
      body: JSON.stringify(items),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API bulkCreate failed, local save succeeded:', err);
  }

  return { success: true, count: savedCount, message: `Created ${savedCount} clients in local database` };
}

export async function deleteTenant(slug: string): Promise<boolean> {
  await idbDelete(slug);
  try {
    const res = await fetch(`/api/tenants/${slug}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getAuthToken() || ''}`,
      },
    });
    return res.ok;
  } catch {
    return true;
  }
}

export async function bulkDeleteTenants(slugs: string[]): Promise<boolean> {
  for (const slug of slugs) {
    await idbDelete(slug);
  }
  try {
    const res = await fetch('/api/tenants/bulk-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken() || ''}`,
      },
      body: JSON.stringify({ slugs }),
    });
    return res.ok;
  } catch {
    return true;
  }
}

export async function bulkUpdateTenantStatus(slugs: string[], status: 'active' | 'draft' | 'pitched'): Promise<boolean> {
  for (const slug of slugs) {
    const existing = await idbGet(slug);
    if (existing) {
      existing.status = status;
      existing.updatedAt = new Date().toISOString();
      await idbPut(existing);
    }
  }
  try {
    const res = await fetch('/api/tenants/bulk-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken() || ''}`,
      },
      body: JSON.stringify({ slugs, status }),
    });
    return res.ok;
  } catch {
    return true;
  }
}

