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
  console.error('❌ MONGODB_URI is not set in .env');
  process.exit(1);
}

// ── Read completeData.json ──
let baselineData = null;
const primaryDataPath = path.join(rootDir, 'src', 'data', 'completeData.json');
const fallbackDataPath = path.join(rootDir, 'src', 'src', 'data', 'completeData.json');

if (fs.existsSync(primaryDataPath)) {
  baselineData = JSON.parse(fs.readFileSync(primaryDataPath, 'utf8'));
} else if (fs.existsSync(fallbackDataPath)) {
  baselineData = JSON.parse(fs.readFileSync(fallbackDataPath, 'utf8'));
} else {
  console.error('❌ Could not locate completeData.json');
  process.exit(1);
}

// ── Models ──
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
});

const TenantSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
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
  completeData: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { strict: false });

const AdminModel = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const TenantModel = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);

function generateCustomizedCompleteData(profile) {
  const jsonStr = JSON.stringify(baselineData);
  const cleanName = profile.name || 'Max Quality Roofing';
  const cleanPhone = profile.phone || '(406) 217-1720';
  const cleanPhoneDigits = cleanPhone.replace(/\D/g, '');
  const cleanPhoneLink = cleanPhoneDigits ? `tel:+1${cleanPhoneDigits}` : 'tel:+14062171720';
  const cleanEmail = profile.email || 'maxqualityroofing@gmail.com';
  const cleanCity = profile.city || 'Great Falls';
  const cleanState = profile.state || 'MT';
  const cleanOwner = profile.ownerName || 'Max Poitra';

  let customized = jsonStr
    .split('Max Quality Roofing').join(cleanName)
    .split('MAX QUALITY ROOFING').join(cleanName.toUpperCase())
    .split('(406) 217-1720').join(cleanPhone)
    .split('tel:+14062171720').join(cleanPhoneLink)
    .split('maxqualityroofing@gmail.com').join(cleanEmail)
    .split('mailto:maxqualityroofing@gmail.com').join(`mailto:${cleanEmail}`)
    .split('Great Falls').join(cleanCity)
    .split('Cascade County').join(`${cleanCity} Metro`)
    .split('Montana').join(cleanState)
    .split('Max Poitra').join(cleanOwner);

  const parsed = JSON.parse(customized);
  if (profile.tagline && parsed.hero) {
    parsed.hero.headlines = [profile.tagline, `Top-Tier Roofing in ${cleanCity}`];
  }
  return parsed;
}

const SAMPLE_PITCHES = [
  {
    slug: 'apex-peak-roofing',
    name: 'Apex Peak Roofing',
    phone: '(512) 840-2211',
    email: 'info@apexpeakroofing.com',
    city: 'Austin',
    state: 'TX',
    ownerName: 'Marcus Vance',
    tagline: 'Engineered Roofing Built for Texas Heat & Hail',
    colors: {
      primary: '#0F4C81',
      primaryHover: '#0A3358',
      secondary: '#2C3E50',
      accent: '#D4AF37',
    },
  },
  {
    slug: 'summit-shield-roofs',
    name: 'Summit Shield Roofing',
    phone: '(303) 719-4488',
    email: 'quotes@summitshieldroofs.com',
    city: 'Denver',
    state: 'CO',
    ownerName: 'Bradley Cooper',
    tagline: 'High-Altitude Heavy Duty Roofing & Shield Systems',
    colors: {
      primary: '#1B4332',
      primaryHover: '#133124',
      secondary: '#2D6A4F',
      accent: '#E0A96D',
    },
  },
  {
    slug: 'horizon-pro-exteriors',
    name: 'Horizon Pro Roofing & Exteriors',
    phone: '(480) 659-3300',
    email: 'contact@horizonproexteriors.com',
    city: 'Phoenix',
    state: 'AZ',
    ownerName: 'David Sterling',
    tagline: 'Southwest Heat-Resistant Architectural Tile & Shingles',
    colors: {
      primary: '#B85D19',
      primaryHover: '#8C4410',
      secondary: '#2E4057',
      accent: '#F4A261',
    },
  },
  {
    slug: 'blue-ridge-craftsmen',
    name: 'Blue Ridge Roofing Craftsmen',
    phone: '(828) 412-9901',
    email: 'estimates@blueridgeroofing.com',
    city: 'Asheville',
    state: 'NC',
    ownerName: 'Christian Myers',
    tagline: 'Generational Craftsmanship Built to Endure Every Season',
    colors: {
      primary: '#1F2A44',
      primaryHover: '#141C2E',
      secondary: '#3D5A80',
      accent: '#70A288',
    },
  },
  {
    slug: 'vanguard-roof-systems',
    name: 'Vanguard Commercial & Residential Roofing',
    phone: '(206) 913-7722',
    email: 'proposals@vanguardroofsys.com',
    city: 'Seattle',
    state: 'WA',
    ownerName: 'Elena Rostova',
    tagline: 'Next-Gen Waterproofing & Architectural Shingle Excellence',
    colors: {
      primary: '#0A2540',
      primaryHover: '#061626',
      secondary: '#1A365D',
      accent: '#635BFF',
    },
  },
  {
    slug: 'ironwood-timber-roofing',
    name: 'Ironwood Timber & Slate Roofing',
    phone: '(503) 890-3344',
    email: 'hello@ironwoodroofing.com',
    city: 'Portland',
    state: 'OR',
    ownerName: 'Garrett Holt',
    tagline: 'Moss-Resistant Architectural Shingle & Slate Systems',
    colors: {
      primary: '#2B3A41',
      primaryHover: '#1E292E',
      secondary: '#4A6B6C',
      accent: '#C29B38',
    },
  },
  {
    slug: 'solstice-coastal-roofing',
    name: 'Solstice Coastal Roofing',
    phone: '(619) 334-1188',
    email: 'contact@solsticeroofing.com',
    city: 'San Diego',
    state: 'CA',
    ownerName: 'Mateo Delgado',
    tagline: 'Salt-Air Protected Architectural Shingles & Cool Roofs',
    colors: {
      primary: '#005F73',
      primaryHover: '#004352',
      secondary: '#0A9396',
      accent: '#EE9B00',
    },
  },
  {
    slug: 'liberty-crest-contractors',
    name: 'Liberty Crest Roofing Contractors',
    phone: '(215) 778-9900',
    email: 'service@libertycrestroofs.com',
    city: 'Philadelphia',
    state: 'PA',
    ownerName: 'Anthony Rossi',
    tagline: 'Historic Restoration & Commercial Grade Shingle Defense',
    colors: {
      primary: '#1D2D44',
      primaryHover: '#0D1B2A',
      secondary: '#415A77',
      accent: '#778DA9',
    },
  },
  {
    slug: 'lone-star-precision-roofs',
    name: 'Lone Star Precision Roofs',
    phone: '(713) 440-8812',
    email: 'estimates@lonestarprecision.com',
    city: 'Houston',
    state: 'TX',
    ownerName: 'Wyatt Calhoun',
    tagline: 'Gulf Coast Hurricane & Heavy Storm Protection',
    colors: {
      primary: '#780000',
      primaryHover: '#500000',
      secondary: '#003049',
      accent: '#C1121F',
    },
  },
  {
    slug: 'emerald-isle-roofing',
    name: 'Emerald Isle Roofing Craftsmen',
    phone: '(617) 505-6677',
    email: 'office@emeraldisleroofing.com',
    city: 'Boston',
    state: 'MA',
    ownerName: 'Declan Sullivan',
    tagline: 'New England Blizzard & Freeze-Thaw Roofing Specialists',
    colors: {
      primary: '#143601',
      primaryHover: '#0C2100',
      secondary: '#245501',
      accent: '#538D22',
    },
  },
];

async function runSeed() {
  console.log('Connecting to MongoDB Atlas...');
  console.log(`URI: ${MONGODB_URI.replace(/:([^@]+)@/, ':****@')}`);
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected successfully to MongoDB!');

  // 1. Seed or Update Admin User
  console.log('\n--- Seeding Admin User ---');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

  const adminResult = await AdminModel.findOneAndUpdate(
    { username: ADMIN_USERNAME },
    {
      username: ADMIN_USERNAME,
      passwordHash,
      role: 'admin',
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );
  console.log(`✅ Admin user seeded/updated: ${adminResult.username}`);

  // 2. Seed Flagship Tenant: max-quality-roofing
  console.log('\n--- Seeding Flagship Tenant (max-quality-roofing) ---');
  const flagshipTenant = {
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
    completeData: baselineData,
    updatedAt: new Date(),
  };

  await TenantModel.findOneAndUpdate(
    { slug: flagshipTenant.slug },
    flagshipTenant,
    { upsert: true, new: true }
  );
  console.log('✅ Flagship tenant "max-quality-roofing" seeded/updated.');

  // 3. Seed Sample Pitches
  console.log(`\n--- Seeding ${SAMPLE_PITCHES.length} Pitch Tenants ---`);
  for (const p of SAMPLE_PITCHES) {
    const customizedData = generateCustomizedCompleteData(p);
    const tenantPayload = {
      slug: p.slug,
      name: p.name,
      status: 'active',
      phone: p.phone,
      email: p.email,
      location: `${p.city}, ${p.state}`,
      media: {
        logo: '/logo.webp',
        heroBg: '/assets/newhero.webp',
      },
      colors: p.colors,
      customCss: `:root {\n  --brand-city: "${p.city}";\n  --brand-state: "${p.state}";\n}`,
      completeData: customizedData,
      updatedAt: new Date(),
    };

    await TenantModel.findOneAndUpdate(
      { slug: p.slug },
      tenantPayload,
      { upsert: true, new: true }
    );
    console.log(`  ✓ Seeded: ${p.slug} (${p.name})`);
  }

  const count = await TenantModel.countDocuments();
  console.log(`\n🎉 All done! Total tenants in MongoDB: ${count}`);

  await mongoose.disconnect();
  console.log('MongoDB connection closed.');
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed with error:', err);
  process.exit(1);
});
