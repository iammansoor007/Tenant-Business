import fs from 'fs';

const BASE_URL = 'http://localhost:8080';
const ADMIN_USER = 'admin@pitchplatform.com';
const ADMIN_PASS = 'admin12345!';

const baselineData = JSON.parse(fs.readFileSync('./src/src/data/completeData.json', 'utf8'));

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

export const SAMPLE_PITCHES = [
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

async function seed() {
  console.log('Authenticating with PitchEngine...');
  const authRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
  });
  const authData = await authRes.json();
  const token = authData.token;

  console.log(`Seeding ${SAMPLE_PITCHES.length} flagship pitch clients into MongoDB...`);
  for (const p of SAMPLE_PITCHES) {
    const completeData = generateCustomizedCompleteData(p);
    const payload = {
      slug: p.slug,
      name: p.name,
      status: 'active',
      media: {
        logo: '/logo.webp',
        heroBg: '/assets/newhero.webp',
      },
      colors: p.colors,
      customCss: `:root {\n  --brand-city: "${p.city}";\n  --brand-state: "${p.state}";\n}`,
      completeData,
    };

    const res = await fetch(`${BASE_URL}/api/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const d = await res.json();
    console.log(`✓ Seeded ${p.slug} (${p.name}): ${d.success ? 'OK' : 'FAIL'}`);
  }

  console.log(`\nAll ${SAMPLE_PITCHES.length} flagship pitches successfully saved and live!`);
}

seed().catch(console.error);
