import fs from 'fs';

const BASE_URL = 'http://localhost:8080';
const ADMIN_USER = 'admin@pitchplatform.com';
const ADMIN_PASS = 'admin12345!';

const baselineData = JSON.parse(fs.readFileSync('./src/data/completeData.json', 'utf8'));

function createJunkRemovalCompleteData(config) {
  const data = JSON.parse(JSON.stringify(baselineData));
  const { name, phone, email, city, state, tagline, ownerName } = config;
  const phoneClean = phone.replace(/\D/g, '');
  const phoneLink = `tel:+1${phoneClean}`;

  // 1. Navbar
  data.navbar.companyLinks = [
    { label: 'Home', href: '#', icon: 'Home' },
    { label: 'Services', href: '#services', icon: 'Sparkles' },
    { label: 'How It Works', href: '#how-we-work', icon: 'ClipboardCheck' },
    { label: 'Why Choose Us', href: '#why-choose-us', icon: 'Award' },
    { label: 'Reviews', href: '#testimonials', icon: 'Star' },
    { label: 'Get Quote', href: '#quote', icon: 'Phone' },
  ];
  data.navbar.services = [
    {
      title: 'RESIDENTIAL JUNK REMOVAL',
      description: 'Full-service clutter clearing from garages, attics, basements, and living spaces.',
      icon: 'Home',
      items: ['Furniture & Mattress Disposal', 'Attic & Basement Cleanouts', 'Appliance Removal'],
      features: ['Eco-Friendly Donation & Recycling', 'Same-Day Service Available', 'Upfront Transparent Pricing'],
    },
    {
      title: 'COMMERCIAL CLEANOUTS',
      description: 'Office, retail, warehouse, and estate property debris removal with zero downtime.',
      icon: 'ClipboardCheck',
      items: ['Office Furniture Removal', 'Warehouse Cleanouts', 'Retail Debris Clearing'],
      features: ['Licensed & Fully Insured', 'Volume-Based Discounts', 'After-Hours Pickups'],
    },
    {
      title: 'HEAVY DEBRIS & DEMOLITION',
      description: 'Construction scrap, concrete, hot tubs, fencing, and shed teardowns.',
      icon: 'Sun',
      items: ['Hot Tub Removal', 'Shed Demolition', 'Construction Waste Hauling'],
      features: ['Heavy Equipment Ready', 'Broom-Clean Guarantee', 'Safe Disposal Guaranteed'],
    },
  ];

  // 2. Hero
  data.hero = {
    badge: 'Premier Junk Removal & Hauling',
    headlines: [
      `Fast, Dependable Junk Removal in ${city}`,
      'You Point. We Haul. Clutter Gone Today.',
    ],
    highlight: tagline,
    subheadline: `${name} is ${city}'s trusted, full-service junk removal crew. From single items to entire estate clear-outs, we do all the heavy lifting so you don't have to.`,
    primaryCta: {
      text: 'Get Your Free Quote',
      href: '#quote',
      subtext: 'No Obligation • Transparent Upfront Pricing',
    },
    secondaryCta: {
      text: `Call Now: ${phone}`,
      href: phoneLink,
      subtext: 'Same-Day Pickups Available',
    },
    stats: [
      { value: '10,000+', label: 'Tons Hauled & Recycled' },
      { value: '100%', label: 'Broom-Clean Guarantee' },
      { value: '5-Star', label: 'Top Local Rating' },
      { value: 'Same Day', label: 'Fast Response' },
    ],
    reviews: {
      count: '500+ Verified 5-Star Reviews',
      platforms: ['Google Guaranteed', 'Yelp Top Rated', 'HomeAdvisor Elite'],
    },
  };

  // 3. About
  data.about = {
    badge: 'About Us',
    title: {
      prefix: 'Meet ',
      highlight: name,
      suffix: ` — ${city}'s Cleanout Specialists`,
    },
    subtitle: `Founded by ${ownerName}, ${name} was built on a simple promise: honest pricing, prompt arrivals, and eco-responsible disposal.`,
    paragraphs: [
      `We believe getting rid of unwanted junk should never be stressful. Whether you are prepping a house for sale, decluttering your garage, or clearing out construction debris, our team handles all loading, hauling, and cleanup.`,
      `We prioritize recycling and donating usable goods to local charities before anything heads to a transfer station, keeping ${city} clean and green.`,
    ],
    highlights: [
      'Same-Day & Next-Day Availability',
      'All Heavy Lifting & Loading Included',
      'Eco-Friendly Donating & Recycling',
      'Licensed, Bonded, and Fully Insured',
    ],
  };

  // 4. Services Section
  data.services = {
    badge: 'Our Hauling Services',
    headline: {
      prefix: 'Full-Service Junk Removal.',
      highlight: 'Zero Stress.',
      suffix: '',
    },
    description: [
      `${name} handles jobs of all sizes — from curbside mattress pickups to multi-story warehouse cleanouts.`,
      'Sit back and relax while our uniformed crew does all the heavy lifting, loading, and sweeping.',
    ],
    stats: [
      { value: '15 Min', label: 'Arrival Window Alerts' },
      { value: '80%', label: 'Donated or Recycled' },
      { value: '0 Hidden', label: 'Fees Ever' },
    ],
    services: [
      {
        id: 'residential-junk',
        badge: 'Top Pick',
        title: 'Residential Junk Removal',
        tagline: 'Clean up living areas, basements, and yards quickly.',
        features: [
          'Furniture, mattresses & electronics removal',
          'Attic, basement & crawlspace clear-outs',
          'Yard waste, tree limbs & storm cleanup',
        ],
        idealFor: 'Homeowners, renters, and realtors needing quick cleanups.',
      },
      {
        id: 'commercial-hauling',
        badge: 'Business Grade',
        title: 'Commercial Cleanouts',
        tagline: 'Fast turnaround with zero business disruption.',
        features: [
          'Office furniture, cubicles & e-waste',
          'Retail fixture removal & storage units',
          'Property management eviction cleanouts',
        ],
        idealFor: 'Offices, retail locations, and property managers.',
      },
      {
        id: 'light-demolition',
        badge: 'Heavy Duty',
        title: 'Light Demolition & Teardown',
        tagline: 'Safe demolition with full site sweep.',
        features: [
          'Hot tub removal & disconnect',
          'Old shed, fence & deck demolition',
          'Carpet removal & tile tear-outs',
        ],
        idealFor: 'Renovators, homeowners, and contractors.',
      },
      {
        id: 'estate-cleanouts',
        badge: 'Compassionate Care',
        title: 'Estate & Foreclosure Cleanouts',
        tagline: 'Respectful, organized clearing for entire properties.',
        features: [
          'Item sorting for donation & appraisal',
          'Complete whole-home cleanouts',
          'Broom-clean handover guarantee',
        ],
        idealFor: 'Families, estate executors, and attorneys.',
      },
    ],
    cardCta: 'Request Hauling Quote',
    cta: {
      title: `Ready to reclaim your space in ${city}?`,
      subtitle: `Call ${phone} or book online in under 60 seconds.`,
      button: 'Book My Removal',
      href: '#quote',
    },
  };

  // 5. Testimonials
  data.testimonials = {
    badge: 'Client Reviews',
    title: {
      prefix: 'What ',
      highlight: `${city} Locals`,
      suffix: ' Say About Our Crew',
    },
    subtitle: `Real stories from real customers who trusted ${name} with their clutter.`,
    reviews: [
      {
        author: 'Sarah Jenkins',
        location: `${city}, ${state}`,
        role: 'Homeowner',
        rating: 5,
        review: `These guys are lifesavers! Emptied out a two-car garage full of 15 years of accumulated junk in less than two hours. Cleaned up afterwards too!`,
      },
      {
        author: 'Robert Martinez',
        location: `${city}, ${state}`,
        role: 'Real Estate Broker',
        rating: 5,
        review: `I use ${name} for all my listing cleanouts. They are fast, on time, fairly priced, and leave the houses broom-clean. Cannot recommend them enough.`,
      },
      {
        author: 'Amanda Vance',
        location: `${city}, ${state}`,
        role: 'Business Owner',
        rating: 5,
        review: `Called them for an emergency office clearout before our lease expired. They arrived same day, gave an honest flat rate, and handled everything smoothly.`,
      },
    ],
  };

  // 6. FAQ
  data.faq = {
    badge: 'Frequently Asked Questions',
    title: 'Everything You Need to Know',
    subtitle: 'Transparent answers to your junk removal questions.',
    questions: [
      {
        q: 'How does your junk removal pricing work?',
        a: 'Our pricing is based simply on how much space your items take up in our large hauling trucks. We provide an exact, all-inclusive quote before we touch a single item — no hidden surcharges or surprise fees.',
      },
      {
        q: 'What items can you take away?',
        a: 'We take almost anything! Furniture, appliances, yard debris, electronics, hot tubs, mattresses, construction scrap, and household items. The only exceptions are hazardous materials like biohazards and hazardous chemicals.',
      },
      {
        q: 'Do I have to move items outside or to the curb?',
        a: 'Nope! We provide true full-service removal. Wherever your items are located — upstairs, in the backyard, or in a crawlspace — our crew will carry it out for you.',
      },
      {
        q: 'Do you offer same-day pickups?',
        a: 'Yes! We keep trucks available across the metro area for same-day and emergency cleanouts. Call us early in the day for immediate dispatch.',
      },
    ],
  };

  // 7. Footer & Contact
  data.footer = {
    company: {
      name,
      description: `${tagline}. Serving ${city}, ${state} and surrounding metro communities with top-rated residential and commercial hauling.`,
    },
    contact: {
      phone,
      phoneLink,
      email,
      emailLink: `mailto:${email}`,
      address: `${city}, ${state}`,
      hours: 'Mon - Sun: 7:00 AM - 8:00 PM',
    },
    links: [
      { label: 'Home', href: '#' },
      { label: 'Services', href: '#services' },
      { label: 'How We Work', href: '#how-we-work' },
      { label: 'Reviews', href: '#testimonials' },
      { label: 'Free Estimate', href: '#quote' },
    ],
  };

  return data;
}

export const JUNK_PITCHES = [
  {
    slug: 'tnb-junk-removal',
    name: 'TNB Junk Removal',
    phone: '(615) 601-2244',
    email: 'contact@tnbjunkremoval.com',
    city: 'Nashville',
    state: 'TN',
    ownerName: 'Travis B.',
    tagline: 'Fast, Dependable Residential & Commercial Junk Removal',
    colors: {
      primary: '#0D5C3A',       // Eco green
      primaryHover: '#083D26',
      secondary: '#1F2937',     // Deep graphite
      accent: '#F59E0B',        // Caution Amber
    },
    seo: {
      title: 'TNB Junk Removal | Top-Rated Hauling & Cleanouts in Nashville, TN',
      description: 'Fast, affordable residential & commercial junk removal in Nashville, TN. We haul furniture, appliances, yard waste, and clean out full properties.',
      keywords: 'junk removal Nashville, haul away services TN, furniture disposal, estate cleanouts Nashville, TNB junk removal',
    },
  },
  {
    slug: 'come-and-take-it-junk-removal',
    name: 'Come and Take It Junk Removal',
    phone: '(512) 898-7722',
    email: 'dispatch@comeandtakeitjunk.com',
    city: 'Austin',
    state: 'TX',
    ownerName: 'Beau Cannon',
    tagline: 'Texas-Tough Junk Hauling, Cleanouts & Light Demolition',
    colors: {
      primary: '#8B1E1E',       // Texas Maroon / Crimson
      primaryHover: '#631313',
      secondary: '#1E293B',     // Lone Star Slate
      accent: '#EAB308',        // Texas Star Amber Gold
    },
    seo: {
      title: 'Come and Take It Junk Removal | Texas-Tough Hauling in Austin, TX',
      description: 'Texas-tough junk hauling in Austin & Central Texas. Shed demolition, estate cleanouts, construction debris, and same-day junk pickups.',
      keywords: 'Come and Take It Junk Removal, Austin junk removal, Texas junk hauling, hot tub removal Austin, cleanouts Central Texas',
    },
  },
];

async function run() {
  console.log('Authenticating with PitchEngine API...');
  const authRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
  });
  const authData = await authRes.json();
  const token = authData.token;
  console.log('✓ Authenticated successfully.');

  for (const p of JUNK_PITCHES) {
    console.log(`\nGenerating tailored pitch for "${p.name}" (${p.slug})...`);
    const completeData = createJunkRemovalCompleteData(p);

    const payload = {
      slug: p.slug,
      name: p.name,
      phone: p.phone,
      email: p.email,
      location: `${p.city}, ${p.state}`,
      status: 'active',
      media: {
        logo: '/logo.webp',
        heroBg: '/assets/newhero.webp',
      },
      colors: p.colors,
      seo: p.seo,
      customCss: `:root {\n  --brand-city: "${p.city}";\n  --brand-state: "${p.state}";\n  --brand-slogan: "${p.tagline}";\n}`,
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

    const result = await res.json();
    console.log(`✓ Result for ${p.slug}:`, result.success ? 'SUCCESS (Created & Live)' : result.message);
  }

  console.log('\n--- VERIFYING PITCHES ARE ACCESSIBLE ---');
  for (const p of JUNK_PITCHES) {
    const checkRes = await fetch(`${BASE_URL}/api/tenants/${p.slug}`);
    const checkData = await checkRes.json();
    console.log(`• /api/tenants/${p.slug} -> Status ${checkRes.status}, Found: ${checkData.success ? checkData.tenant?.name : 'NO'}`);
  }
}

run().catch(console.error);
