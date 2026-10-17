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
  schemaType?: string;
  customSchemaJson?: string | Record<string, any>;
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
  customDomain?: string;
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
  customDomain?: string;
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

export interface PitchVisit {
  _id?: string;
  slug: string;
  sessionId: string;
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  org?: string;
  deviceType?: 'Mobile' | 'Tablet' | 'Desktop';
  deviceModel?: string;
  browser?: string;
  os?: string;
  screen?: string;
  language?: string;
  referrer?: string;
  referrerDomain?: string;
  timezone?: string;
  prospectLocalTime?: string;
  connectionType?: string;
  downlinkSpeed?: string;
  rtt?: string;
  batteryLevel?: string;
  isCharging?: boolean;
  cpuCores?: number;
  deviceMemoryGb?: number;
  pixelRatio?: string;
  screenOrientation?: string;
  tabSwitches?: number;
  idleSeconds?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  firstSeen: string;
  lastSeen: string;
  durationSeconds: number;
  scrollDepth: number;
  sectionsViewed: string[];
  sectionEngagement?: Record<string, number>;
  clickedButtons?: Array<{
    text: string;
    tag: string;
    href?: string;
    timestamp: string;
  }>;
  rageClicks?: Array<{
    text: string;
    count: number;
    timestamp: string;
  }>;
  clickedPhone?: boolean;
  clickedCta?: boolean;
  submittedForm?: boolean;
  exitIntent?: boolean;
  copiedTexts?: string[];
  engagementScore?: number;
  intentCategory?: 'HOT' | 'WARM' | 'COLD' | 'BOUNCE';
  eventsTimeline?: Array<{
    type: 'OPEN' | 'SCROLL' | 'CLICK' | 'COPY' | 'EXIT_INTENT' | 'FORM_SUBMIT' | 'RAGE_CLICK' | 'TAB_SWITCH' | 'BACKTRACK';
    label: string;
    elapsedSeconds: number;
    timestamp: string;
  }>;
  visitCount: number;
}

export interface ClientAnalyticsSummary {
  slug: string;
  isOpened: boolean;
  isLiveNow?: boolean;
  totalVisits: number;
  uniqueSessions: number;
  totalDurationSeconds: number;
  maxScrollDepth: number;
  firstOpenedAt?: string;
  lastOpenedAt?: string;
  latestLocation?: string;
  latestDevice?: string;
  latestBrowser?: string;
  latestIp?: string;
  latestOrg?: string;
  latestTimezone?: string;
  latestConnection?: string;
  latestBattery?: string;
  engagementScore?: number;
  intentCategory?: 'HOT' | 'WARM' | 'COLD' | 'BOUNCE';
  clickedPhone: boolean;
  clickedCta: boolean;
  submittedForm: boolean;
  rageClicksCount?: number;
  visits: PitchVisit[];
}



