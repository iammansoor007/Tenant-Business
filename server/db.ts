import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pitchengine';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin@pitchplatform.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin12345!';

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
  if (isDbConnected) return true;

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500, // Quick timeout if no mongo daemon
    });
    isDbConnected = true;
    console.log('✅ Connected to MongoDB at:', MONGODB_URI);

    // Seed default admin if missing
    await seedDefaultAdmin();
    return true;
  } catch (err: any) {
    console.warn('⚠️ MongoDB connection not available. Falling back to local offline memory/client storage mode:', err.message);
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
