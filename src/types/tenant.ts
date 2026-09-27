export interface TenantSeo {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterHandle?: string;
  canonicalUrl?: string;
  geoRegion?: string;
  geoPlacename?: string;
}

export interface TenantMedia {
  logo?: string;
  heroBg?: string;
  aboutImage?: string;
  founderImage?: string;
  servicesCard?: string;
  serviceCard1?: string;
  serviceCard2?: string;
  serviceCard3?: string;
  serviceCard4?: string;
  vector?: string;
  howWeWorkVector?: string;
  faqVector?: string;
  [key: string]: string | undefined;
}

export interface TenantColors {
  primary?: string;
  primaryHover?: string;
  secondary?: string;
  accent?: string;
  customCss?: string;
}

export interface Tenant {
  _id?: string;
  id?: string;
  slug: string;
  name: string;
  phone?: string;
  email?: string;
  location?: string;
  status?: "active" | "draft" | "pitched";
  media: TenantMedia;
  colors?: TenantColors;
  customCss?: string;
  seo?: TenantSeo;
  completeData: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface BulkTenantItem {
  slug: string;
  name: string;
  completeData?: Record<string, any>;
  colors?: TenantColors;
  media?: TenantMedia;
  customCss?: string;
  seo?: TenantSeo;
  phone?: string;
  email?: string;
  location?: string;
  city?: string;
  state?: string;
  tagline?: string;
}

