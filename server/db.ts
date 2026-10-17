import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

import fs from 'fs';
import path from 'path';

export function getMongoUri(): string {
  let uri = process.env.MONGODB_URI || '';
  if (!uri || uri.includes('<username>')) {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
        if (parsed.MONGODB_URI && !parsed.MONGODB_URI.includes('<username>')) {
          process.env.MONGODB_URI = parsed.MONGODB_URI;
          uri = parsed.MONGODB_URI;
        }
      }
    } catch {}
  }
  return uri || 'mongodb://localhost:27017/pitchengine';
}

export function getAdminCreds() {
  let user = process.env.ADMIN_USERNAME || '';
  let pass = process.env.ADMIN_PASSWORD || '';
  if (!user || user.includes('yourdomain')) {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
        if (parsed.ADMIN_USERNAME) user = parsed.ADMIN_USERNAME;
        if (parsed.ADMIN_PASSWORD) pass = parsed.ADMIN_PASSWORD;
      }
    } catch {}
  }
  return {
    username: user || 'admin@pitchplatform.com',
    password: pass || 'admin12345!',
  };
}

export let isDbConnected = false;

// ─── ADMIN SCHEMA & MODEL ───
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
});

export const AdminModel = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

// ─── TENANT SCHEMA & MODEL ───
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

TenantSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const TenantModel = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);

// ─── PITCH VISIT / ANALYTICS SCHEMA & MODEL ───
const PitchVisitSchema = new mongoose.Schema({
  slug: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  ip: { type: String, default: '' },
  city: { type: String, default: '' },
  region: { type: String, default: '' },
  country: { type: String, default: '' },
  org: { type: String, default: '' },
  deviceType: { type: String, default: 'Desktop' },
  deviceModel: { type: String, default: '' },
  browser: { type: String, default: '' },
  os: { type: String, default: '' },
  screen: { type: String, default: '' },
  language: { type: String, default: '' },
  referrer: { type: String, default: '' },
  referrerDomain: { type: String, default: '' },
  timezone: { type: String, default: '' },
  prospectLocalTime: { type: String, default: '' },
  connectionType: { type: String, default: '' },
  downlinkSpeed: { type: String, default: '' },
  rtt: { type: String, default: '' },
  batteryLevel: { type: String, default: '' },
  isCharging: { type: Boolean, default: false },
  cpuCores: { type: Number, default: 0 },
  deviceMemoryGb: { type: Number, default: 0 },
  pixelRatio: { type: String, default: '' },
  screenOrientation: { type: String, default: '' },
  tabSwitches: { type: Number, default: 0 },
  idleSeconds: { type: Number, default: 0 },
  utmSource: { type: String, default: '' },
  utmMedium: { type: String, default: '' },
  utmCampaign: { type: String, default: '' },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  durationSeconds: { type: Number, default: 0 },
  scrollDepth: { type: Number, default: 0 },
  sectionsViewed: { type: [String], default: [] },
  sectionEngagement: { type: mongoose.Schema.Types.Mixed, default: {} },
  clickedButtons: { type: [mongoose.Schema.Types.Mixed], default: [] },
  rageClicks: { type: [mongoose.Schema.Types.Mixed], default: [] },
  clickedPhone: { type: Boolean, default: false },
  clickedCta: { type: Boolean, default: false },
  submittedForm: { type: Boolean, default: false },
  exitIntent: { type: Boolean, default: false },
  copiedTexts: { type: [String], default: [] },
  engagementScore: { type: Number, default: 0 },
  intentCategory: { type: String, default: 'COLD' },
  eventsTimeline: { type: [mongoose.Schema.Types.Mixed], default: [] },
  visitCount: { type: Number, default: 1 },
}, { timestamps: true });

if (mongoose.models.PitchVisit) {
  try {
    delete mongoose.models.PitchVisit;
  } catch {}
}
export const PitchVisitModel = mongoose.models.PitchVisit || mongoose.model('PitchVisit', PitchVisitSchema);

// ─── CONNECT & SEED ───
export async function connectDB(): Promise<boolean> {
  if (isDbConnected && mongoose.connection.readyState === 1) return true;

  const activeUri = getMongoUri();

  // If deployed on Vercel and no external MongoDB Atlas URI is set, do not hang trying to reach localhost
  if (process.env.VERCEL && (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost'))) {
    isDbConnected = false;
    return false;
  }

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(activeUri, {
        serverSelectionTimeoutMS: 2000,
      });
    }
    isDbConnected = (mongoose.connection.readyState === 1);
    if (isDbConnected) {
      console.log('✅ Connected to MongoDB at:', activeUri.replace(/:([^@]+)@/, ':****@'));
      await seedDefaultAdmin();
    }
    return isDbConnected;
  } catch (err: any) {
    console.warn('⚠️ MongoDB connection not available. Falling back to local offline memory mode:', err.message);
    isDbConnected = false;
    return false;
  }
}

async function seedDefaultAdmin() {
  try {
    const { username: ADMIN_USERNAME, password: ADMIN_PASSWORD } = getAdminCreds();
    const existing = await AdminModel.findOne({ username: ADMIN_USERNAME });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(ADMIN_PASSWORD, salt);
      await AdminModel.create({
        username: ADMIN_USERNAME,
        passwordHash: hash,
        role: 'admin',
      });
      console.log(`🌱 Default admin seeded successfully: ${ADMIN_USERNAME}`);
    }
  } catch (seedErr: any) {
    console.warn('Could not seed default admin:', seedErr.message);
  }
}
