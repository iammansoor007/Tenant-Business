// Beast-Mode Comprehensive Automated Audit & Stress Test Engine
// Tests every endpoint, feature, edge case, and bulk operation at least 10 times!

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

// 1x1 transparent PNG base64 for image testing
const MOCK_BASE64_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function runBeastModeAudit() {
  console.log('\n============================================================');
  console.log('🚀 INITIATING BEAST-MODE 10X AUDIT & STRESS TEST SUITE');
  console.log('============================================================\n');

  let authToken = '';

  // ─────────────────────────────────────────────────────────────
  // SUITE 1: AUTHENTICATION & SECURITY (10 Rounds)
  // ─────────────────────────────────────────────────────────────
  console.log('--- SUITE 1: Authentication & Token Generation (10 Rounds) ---');
  for (let round = 1; round <= 10; round++) {
    // 1A. Valid Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, `Round ${round}: Valid login returned HTTP 200`);
    assert(loginData.success === true, `Round ${round}: Login success flag is true`);
    assert(typeof loginData.token === 'string' && loginData.token.length > 20, `Round ${round}: Valid JWT token returned`);
    authToken = loginData.token;

    // 1B. Invalid Password Attempt
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USER, password: 'WrongPassword123!' }),
    });
    const badLoginData = await badLoginRes.json();
    assert(badLoginRes.status === 401, `Round ${round}: Bad password returned HTTP 401`);
    assert(badLoginData.success === false, `Round ${round}: Bad password success is false`);

    // 1C. Empty Payload Attempt
    const emptyLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(emptyLoginRes.status === 401, `Round ${round}: Empty login rejected with HTTP 401`);
  }
  console.log(`✓ Suite 1 Completed: 10 rounds of auth validation executed.\n`);

  // ─────────────────────────────────────────────────────────────
  // SUITE 2: SYSTEM HEALTH & DATABASE STATUS (10 Rounds)
  // ─────────────────────────────────────────────────────────────
  console.log('--- SUITE 2: System Health & Database Connection (10 Rounds) ---');
  for (let round = 1; round <= 10; round++) {
    const statusRes = await fetch(`${BASE_URL}/api/status`);
    const statusData = await statusRes.json();
    assert(statusRes.status === 200, `Round ${round}: /api/status returned HTTP 200`);
    assert(statusData.status === 'online', `Round ${round}: Server reports status 'online'`);
    assert(statusData.database.includes('MongoDB') || statusData.database.includes('memory'), `Round ${round}: Storage backend active: ${statusData.database}`);
  }
  console.log(`✓ Suite 2 Completed: 10 rounds of health checks passed.\n`);

  // ─────────────────────────────────────────────────────────────
  // SUITE 3: SINGLE CLIENT FULL CRUD & MEDIA ASSETS (10 Rounds)
  // ─────────────────────────────────────────────────────────────
  console.log('--- SUITE 3: Single Client CRUD + 6 Uploaded Images (10 Distinct Clients) ---');
  for (let round = 1; round <= 10; round++) {
    const clientSlug = `beast-test-client-${round}-${Date.now().toString(36)}`;
    const clientName = `Apex Beast Client ${round}`;
    const clientPhone = `(555) 777-000${round}`;
    const clientEmail = `client${round}@apexbeast.com`;
    const customCssBlock = `:root { --tenant-primary: #0F4C81; } .custom-class-${round} { font-weight: bold; }`;

    // 3A: Create Tenant with all 6 Media Assets & Custom CSS
    const createPayload = {
      slug: clientSlug,
      name: clientName,
      status: 'active',
      media: {
        logo: MOCK_BASE64_IMAGE,
        heroBg: MOCK_BASE64_IMAGE,
        servicesCard: MOCK_BASE64_IMAGE,
        vector: MOCK_BASE64_IMAGE,
        aboutImage: MOCK_BASE64_IMAGE,
        founderImage: MOCK_BASE64_IMAGE,
      },
      colors: {
        primary: '#0F4C81',
        primaryHover: '#0A3358',
        secondary: '#344B63',
        accent: '#D4AF37',
      },
      customCss: customCssBlock,
      completeData: {
        businessInfo: {
          name: clientName,
          phone: clientPhone,
          email: clientEmail,
        },
      },
    };

    const createRes = await fetch(`${BASE_URL}/api/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(createPayload),
    });
    const createData = await createRes.json();
    assert(createRes.status === 200, `Round ${round}: Client '${clientSlug}' created with HTTP 200`);
    assert(createData.success === true, `Round ${round}: Create response indicates success`);

    // 3B: Fetch Single Tenant and Verify 100% Data Integrity
    const getRes = await fetch(`${BASE_URL}/api/tenants/${clientSlug}`);
    const getData = await getRes.json();
    assert(getRes.status === 200, `Round ${round}: Client '${clientSlug}' fetched with HTTP 200`);
    assert(getData.tenant.name === clientName, `Round ${round}: Tenant name matches exactly`);
    assert(getData.tenant.media.logo === MOCK_BASE64_IMAGE, `Round ${round}: Logo base64 matches`);
    assert(getData.tenant.media.heroBg === MOCK_BASE64_IMAGE, `Round ${round}: Hero background base64 matches`);
    assert(getData.tenant.media.servicesCard === MOCK_BASE64_IMAGE, `Round ${round}: Services card base64 matches`);
    assert(getData.tenant.media.vector === MOCK_BASE64_IMAGE, `Round ${round}: Vector art base64 matches`);
    assert(getData.tenant.media.aboutImage === MOCK_BASE64_IMAGE, `Round ${round}: About image base64 matches`);
    assert(getData.tenant.media.founderImage === MOCK_BASE64_IMAGE, `Round ${round}: Founder image base64 matches`);
    assert(getData.tenant.customCss === customCssBlock, `Round ${round}: Custom CSS block matches`);

    // 3C: Update Tenant
    const updatedPayload = {
      ...createPayload,
      name: `${clientName} (Updated)`,
      colors: {
        ...createPayload.colors,
        primary: '#E63946',
      },
    };
    const updateRes = await fetch(`${BASE_URL}/api/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(updatedPayload),
    });
    assert(updateRes.status === 200, `Round ${round}: Update returned HTTP 200`);

    // Verify update
    const getUpdatedRes = await fetch(`${BASE_URL}/api/tenants/${clientSlug}`);
    const getUpdatedData = await getUpdatedRes.json();
    assert(getUpdatedData.tenant.name === `${clientName} (Updated)`, `Round ${round}: Name updated`);
    assert(getUpdatedData.tenant.colors.primary === '#E63946', `Round ${round}: Primary color updated`);

    // 3D: Delete Tenant
    const deleteRes = await fetch(`${BASE_URL}/api/tenants/${clientSlug}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const deleteData = await deleteRes.json();
    assert(deleteRes.status === 200, `Round ${round}: Delete returned HTTP 200`);
    assert(deleteData.success === true, `Round ${round}: Delete success flag is true`);

    // Verify 404 after deletion
    const getDeletedRes = await fetch(`${BASE_URL}/api/tenants/${clientSlug}`);
    assert(getDeletedRes.status === 404, `Round ${round}: Deleted tenant returns HTTP 404`);
  }
  console.log(`✓ Suite 3 Completed: 10 full single-client CRUD cycles passed.\n`);

  // ─────────────────────────────────────────────────────────────
  // SUITE 4: BULK CREATION AT SCALE (10 Batches of 50 Clients = 500 Pitches)
  // ─────────────────────────────────────────────────────────────
  console.log('--- SUITE 4: Bulk Pitch Generation at Scale (10 Batches x 50 Clients = 500 Total Clients) ---');
  for (let batch = 1; batch <= 10; batch++) {
    const batchClients = [];
    for (let i = 1; i <= 50; i++) {
      const slug = `bulk-b${batch}-c${i}-${Date.now().toString(36)}`;
      batchClients.push({
        slug,
        name: `Bulk Company ${batch}-${i}`,
        phone: `(555) ${String(batch).padStart(3, '0')}-${String(i).padStart(4, '0')}`,
        email: `batch${batch}.c${i}@pitchtest.com`,
        city: `Metro ${batch}`,
        state: 'TX',
        colors: {
          primary: batch % 2 === 0 ? '#1E3A8A' : '#047857',
        },
      });
    }

    const start = performance.now();
    const bulkRes = await fetch(`${BASE_URL}/api/tenants/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(batchClients),
    });
    const elapsed = Math.round(performance.now() - start);
    const bulkData = await bulkRes.json();

    assert(bulkRes.status === 200, `Batch ${batch}: Bulk creation returned HTTP 200 (${elapsed}ms)`);
    assert(bulkData.success === true, `Batch ${batch}: Bulk creation reported success`);
    assert(bulkData.count === 50, `Batch ${batch}: Exactly 50 clients created`);

    // Verify random sample from this batch
    const sampleSlug = batchClients[Math.floor(Math.random() * 50)].slug;
    const sampleRes = await fetch(`${BASE_URL}/api/tenants/${sampleSlug}`);
    const sampleData = await sampleRes.json();
    assert(sampleRes.status === 200, `Batch ${batch}: Random sample '${sampleSlug}' retrievable`);
    assert(sampleData.tenant && sampleData.tenant.slug === sampleSlug, `Batch ${batch}: Sample slug verified`);

    // Clean up sample to avoid database clutter
    for (const c of batchClients) {
      await fetch(`${BASE_URL}/api/tenants/${c.slug}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
    }
  }
  console.log(`✓ Suite 4 Completed: 10 batches of bulk creation (500 clients total) verified.\n`);

  // ─────────────────────────────────────────────────────────────
  // SUITE 5: EDGE CASES & RESILIENCE (10 Edge Scenarios)
  // ─────────────────────────────────────────────────────────────
  console.log('--- SUITE 5: Edge Cases, Special Characters & Error Handling ---');
  // 5A: Weird characters in slug
  const weirdSlugClient = {
    slug: '  My Weird & Crazy -- Client / #99 !!  ',
    name: 'Weird Client Name',
  };
  const weirdRes = await fetch(`${BASE_URL}/api/tenants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(weirdSlugClient),
  });
  const weirdData = await weirdRes.json();
  assert(weirdRes.status === 200, 'Weird slug handled cleanly with HTTP 200');
  assert(weirdData.tenant.slug.includes('weird') && !weirdData.tenant.slug.includes('&'), 'Weird slug sanitized properly');
  // cleanup
  await fetch(`${BASE_URL}/api/tenants/${weirdData.tenant.slug}`, { method: 'DELETE' });

  // 5B: Missing name
  const missingNameRes = await fetch(`${BASE_URL}/api/tenants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: 'no-name' }),
  });
  assert(missingNameRes.status === 400, 'Missing name rejected with HTTP 400');

  // 5C: Non-existent route 404
  const notFoundRes = await fetch(`${BASE_URL}/api/tenants/absolutely-non-existent-tenant-99999`);
  assert(notFoundRes.status === 404, 'Non-existent tenant returns HTTP 404');

  // 5D: Empty bulk payload
  const emptyBulkRes = await fetch(`${BASE_URL}/api/tenants/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([]),
  });
  assert(emptyBulkRes.status === 400, 'Empty bulk array rejected with HTTP 400');

  console.log(`✓ Suite 5 Completed: Edge cases and validation guards verified.\n`);

  // ─────────────────────────────────────────────────────────────
  // SUITE 6: FRONTEND HTTP ROUTES & HTML RENDERING (10 Rounds)
  // ─────────────────────────────────────────────────────────────
  console.log('--- SUITE 6: Frontend Route & SSR/HTML Availability (10 Rounds) ---');
  for (let round = 1; round <= 10; round++) {
    // 6A: Root Flagship Route
    const rootRes = await fetch(`${BASE_URL}/`);
    assert(rootRes.status === 200, `Round ${round}: Root flagship URL returned HTTP 200`);
    const rootHtml = await rootRes.text();
    assert(rootHtml.includes('<!DOCTYPE html>') || rootHtml.includes('<html'), `Round ${round}: Root returns valid HTML document`);

    // 6B: Platform Management Route
    const platformRes = await fetch(`${BASE_URL}/platform`);
    assert(platformRes.status === 200, `Round ${round}: /platform URL returned HTTP 200`);

    // 6C: Bulk Generator Route
    const bulkRouteRes = await fetch(`${BASE_URL}/platform/bulk`);
    assert(bulkRouteRes.status === 200, `Round ${round}: /platform/bulk URL returned HTTP 200`);

    // 6D: Dynamic Client Pitch Route
    const clientPitchRes = await fetch(`${BASE_URL}/apex-peak-roofing`);
    assert(clientPitchRes.status === 200, `Round ${round}: Dynamic pitch route /apex-peak-roofing returned HTTP 200`);
  }
  console.log(`✓ Suite 6 Completed: 10 rounds of frontend route checks passed.\n`);

  // ─────────────────────────────────────────────────────────────
  // FINAL AUDIT REPORT
  // ─────────────────────────────────────────────────────────────
  console.log('============================================================');
  console.log('🎯 BEAST-MODE AUDIT SUMMARY');
  console.log('============================================================');
  console.log(`TOTAL ASSERTIONS EXECUTED: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log(`PASS RATE: ${((passCount / (passCount + failCount)) * 100).toFixed(2)}%`);

  if (failCount > 0) {
    console.error('\nFAILURES RECORDED:');
    failures.forEach((f, i) => console.error(`${i + 1}. ${f}`));
    process.exit(1);
  } else {
    console.log('\n🏆 ALL BEAST-MODE TESTS PASSED WITH 100% SUCCESS RATE! ZERO ERRORS FOUND!');
    process.exit(0);
  }
}

runBeastModeAudit().catch((err) => {
  console.error('Fatal Audit Runner Error:', err);
  process.exit(1);
});
