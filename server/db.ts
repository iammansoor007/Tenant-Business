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

// ─── CONNECT & SEED ───
export async function connectDB(): Promise<boolean> {
  if (isDbConnected && mongoose.connection.readyState === 1) return true;

  const activeUri = getMongoUri();

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(activeUri, {
        serverSelectionTimeoutMS: 3000,
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
