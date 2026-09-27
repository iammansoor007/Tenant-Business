import baselineData from '../src/data/completeData.json';

export interface ClientProfile {
  name: string;
  slug?: string;
  phone?: string;
  email?: string;
  location?: string;
  city?: string;
  state?: string;
  ownerName?: string;
  tagline?: string;
}

export function generateCustomizedCompleteData(profile: ClientProfile): Record<string, any> {
  const jsonStr = JSON.stringify(baselineData);

  const isFlagship = !profile.name || profile.name.trim().toLowerCase() === 'max quality roofing';
  const cleanName = profile.name || (isFlagship ? 'Max Quality Roofing' : 'Roofing Contractor');
  const cleanPhone = profile.phone || (isFlagship ? '(406) 217-1720' : '');
  const cleanPhoneDigits = cleanPhone.replace(/\D/g, '');
  const cleanPhoneLink = cleanPhoneDigits ? `tel:+1${cleanPhoneDigits}` : (isFlagship ? 'tel:+14062171720' : '');
  const cleanEmail = profile.email || (isFlagship ? 'maxqualityroofing@gmail.com' : '');
  
  let city = profile.city || '';
  let state = profile.state || '';
  if (!city && profile.location) {
    const parts = profile.location.split(',');
    city = parts[0]?.trim() || '';
    if (parts[1]?.trim()) state = parts[1].trim();
  }
  const cleanCity = city || (isFlagship ? 'Great Falls' : 'Local Area');
  const cleanState = state || (isFlagship ? 'MT' : 'Our Region');
  const cleanOwner = profile.ownerName || (isFlagship ? 'Max Poitra' : (cleanName ? `${cleanName} Leadership` : 'Roofing Team'));

  // Perform targeted substitutions on serialized JSON
  let customized = jsonStr
    .split('Max Quality Roofing').join(cleanName)
    .split('MAX QUALITY ROOFING').join(cleanName.toUpperCase())
    .split('(406) 217-1720').join(cleanPhone)
    .split('tel:+14062171720').join(cleanPhoneLink)
    .split('maxqualityroofing@gmail.com').join(cleanEmail)
    .split('mailto:maxqualityroofing@gmail.com').join(cleanEmail ? `mailto:${cleanEmail}` : '#contact')
    .split('Great Falls').join(cleanCity)
    .split('Cascade County').join(`${cleanCity} Metro`)
    .split('Montana').join(cleanState)
    .split('Max Poitra').join(cleanOwner);

  if (!isFlagship) {
    customized = customized
      .split('Max will give you').join('we will give you')
      .split('Max will diagnose').join('our specialist will diagnose')
      .split('Max will review').join('our team will review')
      .split('Max will respond').join('our team will respond')
      .split('Max personally inspects').join('our team personally inspects')
      .split('Max is an architectural').join('Our team is an architectural')
      .split('Max is ').join('Our team is ')
      .split('MAX QUALITY.').join(`${cleanName.toUpperCase()}.`)
      .split('MAX CRAFTSMANSHIP.').join('EXPERT CRAFTSMANSHIP.')
      .split('MAX QUALITY COMMAND CENTER').join(`${cleanName.toUpperCase()} COMMAND CENTER`)
      .split('Max Quality Guarantee').join(`${cleanName} Guarantee`)
      .split('(406) 555-0192').join(cleanPhone || '(555) 000-0000')
      .split('1200 Central Ave, Great Falls, MT').join(`Main St, ${cleanCity}`)
      .split('Built for Montana weather').join(`Built for ${cleanState} weather`);
  }

  try {
    const parsed = JSON.parse(customized);
    if (profile.tagline && parsed.hero) {
      parsed.hero.headlines = [profile.tagline, `Excellence in ${cleanCity}`];
    }
    return parsed;
  } catch {
    return baselineData;
  }
}

export function getDefaultCompleteDataJson(): string {
  return JSON.stringify(baselineData, null, 2);
}
