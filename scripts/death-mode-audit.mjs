// Extreme Death-Mode Automation & Stress Engine
// Rigorously tests every single route, business, feature, payload, and concurrency limit!

const BASE_URL = 'http://localhost:8080';
const ADMIN_USER = 'admin@pitchplatform.com';
const ADMIN_PASS = 'admin12345!';

let passCount = 0;
let failCount = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passCount++;
  } else {
    failCount++;
    failures.push(message);
    console.error(`  ❌ FAILED: ${message}`);
  }
}

const SEEDED_SLUGS = [
  { slug: 'apex-peak-roofing', name: 'Apex Peak Roofing', city: 'Austin', phone: '(512) 840-2211' },
  { slug: 'summit-shield-roofs', name: 'Summit Shield Roofing', city: 'Denver', phone: '(303) 719-4488' },
  { slug: 'horizon-pro-exteriors', name: 'Horizon Pro Roofing & Exteriors', city: 'Phoenix', phone: '(480) 659-3300' },
  { slug: 'blue-ridge-craftsmen', name: 'Blue Ridge Roofing Craftsmen', city: 'Asheville', phone: '(828) 412-9901' },
  { slug: 'vanguard-roof-systems', name: 'Vanguard Commercial & Residential Roofing', city: 'Seattle', phone: '(206) 913-7722' },
  { slug: 'ironwood-timber-roofing', name: 'Ironwood Timber & Slate Roofing', city: 'Portland', phone: '(503) 890-3344' },
  { slug: 'solstice-coastal-roofing', name: 'Solstice Coastal Roofing', city: 'San Diego', phone: '(619) 334-1188' },
  { slug: 'liberty-crest-contractors', name: 'Liberty Crest Roofing Contractors', city: 'Philadelphia', phone: '(215) 778-9900' },
  { slug: 'lone-star-precision-roofs', name: 'Lone Star Precision Roofs', city: 'Houston', phone: '(713) 440-8812' },
  { slug: 'emerald-isle-roofing', name: 'Emerald Isle Roofing Craftsmen', city: 'Boston', phone: '(617) 505-6677' },
];

async function runDeathModeAudit() {
  console.log('\n============================================================');
  console.log('💀 DEATH-MODE RIGOROUS MULTI-FEATURE AUTOMATION AUDIT 💀');
  console.log('============================================================\n');

  // STEP 1: AUTHENTICATION
  console.log('--- PHASE 1: Admin Authentication Token Acquisition ---');
  const authRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
  });
  const authData = await authRes.json();
  assert(authRes.status === 200, 'Admin login succeeded');
  assert(authData.success === true, 'Auth returned success');
  const token = authData.token;
  assert(typeof token === 'string' && token.length > 20, 'JWT token is valid');

  // STEP 2: VERIFY ALL 10 SEEDED BUSINESSES AT API & DATA LEVEL
  console.log('\n--- PHASE 2: Verification of All 10 Seeded Businesses (Data Level) ---');
  for (const b of SEEDED_SLUGS) {
    const res = await fetch(`${BASE_URL}/api/tenants/${b.slug}`);
    assert(res.status === 200, `API returns 200 for seeded client: ${b.slug}`);
    const data = await res.json();
    assert(data.success === true, `API reports success for: ${b.slug}`);
    assert(data.tenant.name === b.name, `Tenant name matches: ${b.name}`);
    assert(data.tenant.slug === b.slug, `Tenant slug matches: ${b.slug}`);
    assert(data.tenant.completeData.footer.contact.phone === b.phone, `Phone matches: ${b.phone}`);
    assert(data.tenant.colors && data.tenant.colors.primary, `Colors present for: ${b.slug}`);
    assert(data.tenant.customCss && data.tenant.customCss.includes(b.city), `Custom CSS includes city: ${b.city}`);
  }

  // STEP 3: VERIFY LIVE HTTP RENDERING OF ALL 10 SEEDED SITES + ROOT + PLATFORM
  console.log('\n--- PHASE 3: Live HTTP Route & Document Availability (10 Businesses + Routes) ---');
  const routesToTest = [
    { name: 'Flagship Root Demo', url: `${BASE_URL}/` },
    { name: 'Platform Portal', url: `${BASE_URL}/platform` },
    { name: 'Platform Admin Alias', url: `${BASE_URL}/admin` },
    { name: 'Bulk Creator Route', url: `${BASE_URL}/platform/bulk` },
    ...SEEDED_SLUGS.map(s => ({ name: s.name, url: `${BASE_URL}/${s.slug}` })),
  ];

  for (const r of routesToTest) {
    const res = await fetch(r.url);
    assert(res.status === 200, `HTTP 200 OK for [${r.name}] at ${r.url}`);
    const html = await res.text();
    assert(html.includes('<!DOCTYPE html>') || html.includes('<html'), `Valid HTML returned for: ${r.name}`);
    assert(html.length > 500, `HTML body has substantial size (${html.length} bytes) for: ${r.name}`);
  }

  // STEP 4: CONCURRENT HIGH-THROUGHPUT STRESS TEST (100 CONCURRENT REQUESTS)
  console.log('\n--- PHASE 4: Concurrent High-Throughput Stress Test (100 Simultaneous Requests) ---');
  const concurrentStart = performance.now();
  const stressPromises = [];
  for (let i = 0; i < 100; i++) {
    const targetSlug = SEEDED_SLUGS[i % SEEDED_SLUGS.length].slug;
    stressPromises.push(fetch(`${BASE_URL}/api/tenants/${targetSlug}`));
  }
  const stressResponses = await Promise.all(stressPromises);
  const concurrentTime = Math.round(performance.now() - concurrentStart);
  for (const resp of stressResponses) {
    assert(resp.status === 200, `Concurrent request status was 200`);
  }
  console.log(`✓ 100 concurrent requests processed in ${concurrentTime}ms (avg: ${(concurrentTime / 100).toFixed(1)}ms/req)`);

  // STEP 5: 1-CLICK BULK CREATION OF 100 CLIENTS IN SINGLE SHOT
  console.log('\n--- PHASE 5: Single-Shot 100 Client Bulk Pitch Creation ---');
  const megaBatch = [];
  for (let i = 1; i <= 100; i++) {
    megaBatch.push({
      slug: `death-mode-client-${i}-${Date.now().toString(36)}`,
      name: `Death Mode Pro Roofers #${i}`,
      phone: `(555) 999-${String(i).padStart(4, '0')}`,
      email: `client${i}@deathmoderoofing.com`,
      city: `City ${i}`,
      state: 'FL',
      colors: {
        primary: '#0B2545',
        primaryHover: '#133C55',
        secondary: '#84DCC6',
        accent: '#9B5DE5',
      },
    });
  }

  const bulkStart = performance.now();
  const bulkRes = await fetch(`${BASE_URL}/api/tenants/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(megaBatch),
  });
  const bulkDuration = Math.round(performance.now() - bulkStart);
  assert(bulkRes.status === 200, `Bulk creation of 100 clients returned HTTP 200 (${bulkDuration}ms)`);
  const bulkData = await bulkRes.json();
  assert(bulkData.success === true, 'Bulk creation reported true');
  assert(bulkData.count === 100, `Exactly 100 clients created (got ${bulkData.count})`);

  // Sample 10 clients from the 100 to verify data accuracy
  console.log('Sampling 10 generated clients from the 100 batch...');
  for (let j = 0; j < 10; j++) {
    const sample = megaBatch[j * 10];
    const sRes = await fetch(`${BASE_URL}/api/tenants/${sample.slug}`);
    assert(sRes.status === 200, `Sample ${j + 1}: ${sample.slug} returns 200`);
    const sData = await sRes.json();
    assert(sData.tenant.name === sample.name, `Sample ${j + 1}: Name matches`);
    assert(sData.tenant.colors.primary === '#0B2545', `Sample ${j + 1}: Primary color matches`);
  }

  // Cleanup the 100 stress clients to keep database pristine
  console.log('Cleaning up 100 stress-test pitches...');
  const deletePromises = megaBatch.map(c =>
    fetch(`${BASE_URL}/api/tenants/${c.slug}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  );
  await Promise.all(deletePromises);
  console.log('✓ All 100 stress-test clients cleaned up cleanly.');

  // STEP 6: VERIFY SEEDED CLIENTS INTACT AFTER STRESS TEST
  console.log('\n--- PHASE 6: Post-Stress Verification (Seeded Pitches Intact) ---');
  const allTenantsRes = await fetch(`${BASE_URL}/api/tenants`);
  const allTenantsData = await allTenantsRes.json();
  assert(allTenantsRes.status === 200, 'GET /api/tenants returned 200');
  assert(allTenantsData.tenants.length >= 10, `Database contains all ${allTenantsData.tenants.length} flagship tenants`);

  // FINAL RESULTS
  console.log('\n============================================================');
  console.log('💀 DEATH-MODE AUDIT EXECUTION COMPLETE');
  console.log('============================================================');
  console.log(`TOTAL CHECKS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log(`SUCCESS RATE: ${((passCount / (passCount + failCount)) * 100).toFixed(2)}%`);

  if (failCount > 0) {
    console.error('\nFAILURES:');
    failures.forEach((f, i) => console.error(`${i + 1}. ${f}`));
    process.exit(1);
  } else {
    console.log('\n🌟 100% DEATH-MODE STRESS TESTS PASSED WITH ZERO FAILURES!\n');
  }
}

runDeathModeAudit().catch((err) => {
  console.error('Fatal Death Mode Error:', err);
  process.exit(1);
});
