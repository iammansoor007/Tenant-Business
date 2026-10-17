import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin@pitchplatform.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin12345!';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing in .env');
  process.exit(1);
}

// Read completeData.json
const dataPath = path.join(rootDir, 'src', 'data', 'completeData.json');
const baselineData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Mongoose Models
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
});

const TenantSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  phone: String,
  email: String,
  location: String,
  customDomain: String,
  status: { type: String, default: 'active' },
  media: { type: mongoose.Schema.Types.Mixed, default: {} },
  colors: {
    primary: String,
    primaryHover: String,
    secondary: String,
    accent: String,
    customCss: String,
  },
  customCss: String,
  seo: { type: mongoose.Schema.Types.Mixed, default: {} },
  completeData: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { strict: false });

const AdminModel = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const TenantModel = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);

function buildCompleteData(overrides) {
  const cd = JSON.parse(JSON.stringify(baselineData));
  if (cd.footer?.contact) {
    if (overrides.phone) {
      cd.footer.contact.phone = overrides.phone;
      cd.footer.contact.phoneLink = `tel:${overrides.phone.replace(/\D/g, '')}`;
    }
    if (overrides.email) {
      cd.footer.contact.email = overrides.email;
      cd.footer.contact.emailLink = `mailto:${overrides.email}`;
    }
    if (overrides.location) {
      cd.footer.contact.address = overrides.location;
    }
  }
  if (cd.hero) {
    if (overrides.tagline) {
      cd.hero.headlines = [overrides.tagline, `${overrides.name} in ${overrides.location || 'Local Metro'}`];
    }
  }
  return cd;
}

const CLOUD_PITCHES = [
  {
    slug: 'max-quality-roofing',
    name: 'Max Quality Roofing',
    phone: '(406) 217-1720',
    email: 'maxqualityroofing@gmail.com',
    location: 'Great Falls, MT',
    status: 'active',
    media: { logo: '/logo.webp', heroBg: '/assets/newhero.webp' },
    colors: { primary: '#0B1D33', primaryHover: '#12365A', secondary: '#344B63', accent: '#AEB8C2' },
    completeData: baselineData,
  },
  {
    slug: 'a1-hvac',
    name: 'a1 hvac',
    phone: '+13147578637',
    email: 'info@a1hvac-stl.com',
    location: 'St. Louis, Missouri',
    status: 'active',
    media: { logo: '/logo.webp', heroBg: '/assets/newhero.webp' },
    colors: { primary: '#0F4C81', primaryHover: '#0A3358', secondary: '#2C3E50', accent: '#D4AF37' },
    completeData: buildCompleteData({
      name: 'a1 hvac',
      phone: '+13147578637',
      email: 'info@a1hvac-stl.com',
      location: 'St. Louis, Missouri',
      tagline: 'Premier HVAC & Climate Comfort',
    }),
  },
  {
    slug: 'a1-hvac-copy',
    name: 'a1 hvac (Copy)',
    phone: '+13147578637',
    email: 'info@a1hvac-stl.com',
    location: 'St. Louis, Missouri',
    status: 'draft',
    media: { logo: '/logo.webp', heroBg: '/assets/newhero.webp' },
    colors: { primary: '#0F4C81', primaryHover: '#0A3358', secondary: '#2C3E50', accent: '#D4AF37' },
    completeData: buildCompleteData({
      name: 'a1 hvac (Copy)',
      phone: '+13147578637',
      email: 'info@a1hvac-stl.com',
      location: 'St. Louis, Missouri',
      tagline: 'Premier HVAC & Climate Comfort',
    }),
  },
  {
    slug: 'tnb-junk-removal',
    name: 'TNB Junk Removal',
    phone: '(615) 601-2244',
    email: 'contact@tnbjunkremoval.com',
    location: 'Nashville, TN',
    status: 'active',
    media: { logo: '/logo.webp', heroBg: '/assets/newhero.webp' },
    colors: { primary: '#0D5C3A', primaryHover: '#083D26', secondary: '#1F2937', accent: '#F59E0B' },
    completeData: buildCompleteData({
      name: 'TNB Junk Removal',
      phone: '(615) 601-2244',
      email: 'contact@tnbjunkremoval.com',
      location: 'Nashville, TN',
      tagline: 'Fast, Dependable Residential & Commercial Junk Removal',
    }),
  },
  {
    slug: 'come-and-take-it-junk-removal',
    name: 'Come and Take It Junk Removal',
    phone: '(512) 898-7722',
    email: 'dispatch@comeandtakeitjunk.com',
    location: 'Austin, TX',
    status: 'active',
    media: { logo: '/logo.webp', heroBg: '/assets/newhero.webp' },
    colors: { primary: '#8B1E1E', primaryHover: '#631313', secondary: '#1E293B', accent: '#EAB308' },
    completeData: buildCompleteData({
      name: 'Come and Take It Junk Removal',
      phone: '(512) 898-7722',
      email: 'dispatch@comeandtakeitjunk.com',
      location: 'Austin, TX',
      tagline: 'Texas-Tough Junk Hauling, Cleanouts & Light Demolition',
    }),
  },
];

async function sync() {
  console.log('⚡ Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('✅ Connected to MongoDB Atlas Cluster!');

  // 1. Seed Admin
  console.log(`\nChecking admin account (${ADMIN_USERNAME})...`);
  const existingAdmin = await AdminModel.findOne({ username: ADMIN_USERNAME });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(ADMIN_PASSWORD, salt);
    await AdminModel.create({
      username: ADMIN_USERNAME,
      passwordHash: hash,
      role: 'admin',
    });
    console.log(`✓ Admin seeded: ${ADMIN_USERNAME}`);
  } else {
    console.log(`✓ Admin exists: ${ADMIN_USERNAME}`);
  }

  // 2. Sync all Pitches
  console.log(`\nSyncing ${CLOUD_PITCHES.length} pitches to MongoDB Atlas...`);
  for (const p of CLOUD_PITCHES) {
    const saved = await TenantModel.findOneAndUpdate(
      { slug: p.slug },
      { ...p, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Synced /${p.slug} (${p.name}) -> Status: ${saved.status}`);
  }

  // 3. Verify total count
  const allTenants = await TenantModel.find({}).select('slug name status');
  console.log(`\n🎉 Success! Total Pitches currently in MongoDB Atlas: ${allTenants.length}`);
  for (const t of allTenants) {
    console.log(`   • [${t.status.toUpperCase()}] /${t.slug} - "${t.name}"`);
  }

  await mongoose.connection.close();
  console.log('\n🔒 MongoDB connection closed cleanly.');
}

sync().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
