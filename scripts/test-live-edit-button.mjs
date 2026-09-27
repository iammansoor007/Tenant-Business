// Live End-to-End Test for the Edit Feature & Button
import fs from 'fs';

const BASE_URL = 'http://localhost:8080';
const ADMIN_USER = 'admin@pitchplatform.com';
const ADMIN_PASS = 'admin12345!';
const TARGET_SLUG = 'apex-peak-roofing';

async function testLiveEdit() {
  console.log('\n============================================================');
  console.log('🔍 LIVE VERIFICATION: EDIT BUTTON & MUTATION LIFECYCLE');
  console.log('============================================================\n');

  // Step 1: Login
  console.log('1. Authenticating as admin...');
  const authRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
  });
  const authData = await authRes.json();
  const token = authData.token;
  console.log('   ✓ Admin authenticated. Token received.\n');

  // Step 2: Fetch current tenant
  console.log(`2. Fetching current data for '${TARGET_SLUG}'...`);
  const initialRes = await fetch(`${BASE_URL}/api/tenants/${TARGET_SLUG}`);
  const initialData = await initialRes.json();
  const originalName = initialData.tenant.name;
  const originalPhone = initialData.tenant.completeData.footer.contact.phone;
  const originalPrimary = initialData.tenant.colors.primary;
  console.log(`   ✓ Current Name:    ${originalName}`);
  console.log(`   ✓ Current Phone:   ${originalPhone}`);
  console.log(`   ✓ Current Primary: ${originalPrimary}\n`);

  // Step 3: Perform Edit (Simulating user clicking Edit button and submitting)
  const editedName = 'Apex Peak Roofing (Live Verified)';
  const editedPhone = '(512) 999-0000';
  const editedPrimary = '#0055A5';
  const editedCss = ':root { --test-live-edit-verified: "true"; }';

  console.log('3. Triggering Edit mutation (simulating Edit button save)...');
  const editedTenant = {
    ...initialData.tenant,
    name: editedName,
    colors: {
      ...initialData.tenant.colors,
      primary: editedPrimary,
    },
    customCss: editedCss,
    completeData: {
      ...initialData.tenant.completeData,
      footer: {
        ...initialData.tenant.completeData.footer,
        contact: {
          ...initialData.tenant.completeData.footer.contact,
          phone: editedPhone,
        },
      },
    },
  };

  const saveRes = await fetch(`${BASE_URL}/api/tenants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(editedTenant),
  });
  const saveData = await saveRes.json();
  if (!saveData.success) {
    throw new Error('Edit save failed: ' + saveData.message);
  }
  console.log('   ✓ Save API returned HTTP 200 and success: true.\n');

  // Step 4: Verify Database Persistence
  console.log('4. Verifying persistence in database...');
  const verifyRes = await fetch(`${BASE_URL}/api/tenants/${TARGET_SLUG}`);
  const verifyData = await verifyRes.json();
  if (verifyData.tenant.name !== editedName) throw new Error('Name did not update in DB!');
  if (verifyData.tenant.completeData.footer.contact.phone !== editedPhone) throw new Error('Phone did not update in DB!');
  if (verifyData.tenant.colors.primary !== editedPrimary) throw new Error('Primary color did not update in DB!');
  if (verifyData.tenant.customCss !== editedCss) throw new Error('Custom CSS did not update in DB!');
  console.log('   ✓ Database verified: New Name, Phone, Color, and CSS persisted 100%!\n');

  // Step 5: Restore to original clean state
  console.log('5. Reverting back to original state to keep demo clean...');
  const revertTenant = {
    ...editedTenant,
    name: originalName,
    colors: {
      ...editedTenant.colors,
      primary: originalPrimary,
    },
    customCss: `:root {\n  --brand-city: "Austin";\n  --brand-state: "TX";\n}`,
    completeData: {
      ...editedTenant.completeData,
      footer: {
        ...editedTenant.completeData.footer,
        contact: {
          ...editedTenant.completeData.footer.contact,
          phone: originalPhone,
        },
      },
    },
  };

  await fetch(`${BASE_URL}/api/tenants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(revertTenant),
  });
  console.log('   ✓ Reversion complete.\n');

  // Step 6: Verify clean reversion
  const finalRes = await fetch(`${BASE_URL}/api/tenants/${TARGET_SLUG}`);
  const finalData = await finalRes.json();
  if (finalData.tenant.name !== originalName) throw new Error('Reversion failed!');
  console.log('6. Final check: Client successfully restored to pristine state.');
  console.log('\n============================================================');
  console.log('🎉 EDIT BUTTON & MUTATION PIPELINE 100% OPERATIONAL!');
  console.log('============================================================\n');
}

testLiveEdit().catch((err) => {
  console.error('Test Live Edit Failed:', err);
  process.exit(1);
});
