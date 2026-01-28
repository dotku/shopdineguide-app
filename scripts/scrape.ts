import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://shopdineguide.com';
const DELAY_MS = 300;

interface ScrapedBusiness {
  id: number;
  name: string;
  section: string;
  address?: string;
  city?: string;
  neighborhood?: string;
  state?: string;
  zip?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  posterUrl?: string;
  bannerUrl?: string;
  qrCodeUrl?: string;
  galleryUrls: string[];
  googleMapsUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  yelpUrl?: string;
  description?: string;
  categories: string[];
  likeCount: number;
  isHot: boolean;
  isFree: boolean;
  isAd: boolean;
  orderUrl?: string;
  fetchedAt: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(url: string): Promise<string> {
  console.log(`  Fetching: ${url}`);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'ShopDineGuide-App/1.0 (Content Sync)',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function resolveUrl(src: string): string {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  if (src.startsWith('//')) return 'https:' + src;
  // Clean up ../  paths
  let cleaned = src.replace(/^\//, '');
  // Normalize: images/../images/poster/x.jpg -> images/poster/x.jpg
  while (cleaned.includes('../')) {
    cleaned = cleaned.replace(/[^/]+\/\.\.\//g, '');
  }
  return `${BASE_URL}/${cleaned}`;
}

function getImageSource($el: cheerio.Cheerio<any>): string {
  return (
    $el.attr('data-original') ||
    $el.attr('data-src') ||
    $el.attr('data-lazy') ||
    $el.attr('src') ||
    ''
  );
}

// Skip generic/site-wide images
function isGenericImage(src: string): boolean {
  if (!src) return true;
  const genericPatterns = [
    'poster0.jpg',    // generic placeholder on every listing card
    'logo3.png',      // site footer logo
    'logo4.png',      // site footer logo
    'histats.com',    // tracking pixel
    'favicon',
    'bk11.jpg',       // site-wide background
  ];
  return genericPatterns.some((p) => src.includes(p));
}

// Skip generic names from nav/page chrome
function isGenericName(name: string): boolean {
  const skip = [
    'about us', 'about', 'hot deals', 'deals', 'news', 'order',
    'home', 'contact', 'contact us', 'log in', 'login', 'promote',
    'free promote', 'shop', 'dine', 'guide', 'brands', 'coupons',
    'menu', 'hours', 'location', 'reviews', 'photos', 'map',
    'all', 'hot', 'free', 'search',
  ];
  return skip.includes(name.toLowerCase().trim());
}

interface ListingItem {
  id: number;
  name: string;
  logoUrl: string;
  likeCount: number;
  isAd: boolean;
  section: string;
}

function parseListingPage(html: string, section: string): ListingItem[] {
  const $ = cheerio.load(html);
  const items: ListingItem[] = [];

  // Each business card is inside .food1 with a link to showpon.php
  $('a[href*="showpon.php"], a[href*="adshowpon.php"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const idMatch = href.match(/(?:ad)?showpon\.php\?id=(\d+)/);
    if (!idMatch) return;

    const id = parseInt(idMatch[1], 10);
    const isAd = href.includes('adshowpon');

    // Find the card container (.food1, .imgholder, .grid, or parent div)
    const card = $(el).closest('.food1').length
      ? $(el).closest('.food1')
      : $(el).closest('.imgholder').length
      ? $(el).closest('.imgholder')
      : $(el).closest('.grid').length
      ? $(el).closest('.grid')
      : $(el).parent();

    // Extract name from .itemleft-ss or card text
    let name = '';
    const nameEl = card.find('.itemleft-ss');
    if (nameEl.length) {
      name = nameEl.first().text().trim();
    }
    if (!name) {
      // Deals page cards often store the title in an inline-styled div
      $(el)
        .find('div')
        .each((_, child) => {
          const t = $(child).text().trim();
          const style = ($(child).attr('style') || '').toLowerCase();
          if (
            t &&
            t.length > 1 &&
            t.length < 120 &&
            !/^\d+$/.test(t) &&
            (style.includes('font-weight') || style.includes('font-size')) &&
            !name
          ) {
            name = t;
          }
        });
    }
    if (!name) {
      // fallback: find first non-numeric text child inside the anchor to avoid nav text
      $(el)
        .find('div, span')
        .each((_, child) => {
          const t = $(child).text().trim();
          if (t && t.length > 1 && t.length < 100 && !/^\d+$/.test(t) && !name) {
            name = t;
          }
        });
    }
    if (!name) {
      // fallback: broader search within the card
      card.find('div, span').each((_, child) => {
        const t = $(child).text().trim();
        if (t && t.length > 1 && t.length < 100 && !/^\d+$/.test(t) && !name) {
          name = t;
        }
      });
    }
    if (!name || isGenericName(name)) {
      name = `Business ${id}`;
    }

    // Logo: the business-specific image (NOT poster0.jpg)
    // Card has two images: poster0.jpg (background) and logo/xxx.png (business logo)
    let logoUrl = '';
    card.find('img').each((_, img) => {
      const src = getImageSource($(img));
      if (src && !isGenericImage(src)) {
        logoUrl = resolveUrl(src);
      }
    });

    // Like count from .itemleft-s
    let likeCount = 0;
    const countEl = card.find('.itemleft-s');
    if (countEl.length) {
      const numMatch = countEl.text().match(/(\d+)/);
      if (numMatch) likeCount = parseInt(numMatch[1], 10);
    }

    if (!items.find((i) => i.id === id && i.isAd === isAd)) {
      items.push({ id, name, logoUrl, likeCount, isAd, section });
    }
  });

  return items;
}

function parseDetailPage(html: string, id: number): Partial<ScrapedBusiness> {
  const $ = cheerio.load(html);
  const result: Partial<ScrapedBusiness> = { id };

  // Name: prefer h2.title (the actual business name class on shopdineguide)
  const titleEl = $('h2.title, .title h2, h2[class*="title"]');
  if (titleEl.length) {
    const text = titleEl.first().text().trim();
    if (text && text.length > 1 && text.length < 200 && !isGenericName(text)) {
      result.name = text;
    }
  }
  // Fallback: first non-generic h2
  if (!result.name) {
    $('h2').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 1 && text.length < 200 && !isGenericName(text) && !result.name) {
        result.name = text;
      }
    });
  }
  // Fallback to h1
  if (!result.name) {
    $('h1').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 1 && text.length < 200 && !isGenericName(text) && !result.name) {
        result.name = text;
      }
    });
  }

  // Phone
  const phoneLink = $('a[href^="tel:"]').first();
  if (phoneLink.length) {
    result.phone = phoneLink.attr('href')?.replace('tel:', '').replace(/\\/g, '').trim();
  }

  // Website - find external links
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (
      (href.startsWith('http') || href.startsWith('www.')) &&
      !href.includes('shopdineguide') &&
      !href.includes('google') &&
      !href.includes('facebook') &&
      !href.includes('instagram') &&
      !href.includes('yelp') &&
      !href.includes('histats') &&
      !href.includes('goo.gl') &&
      !result.website
    ) {
      result.website = href.startsWith('www.') ? `https://${href}` : href;
    }
  });

  // Google Maps link
  $('a[href*="google.com/maps"], a[href*="goo.gl/maps"], a[href*="maps.google"]').each(
    (_, el) => {
      if (!result.googleMapsUrl) {
        result.googleMapsUrl = $(el).attr('href') || undefined;
      }
    }
  );

  // Address: extract from maps link text
  $('a[href*="goo.gl/maps"], a[href*="google.com/maps"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 5 && text.length < 200 && !result.address) {
      result.address = text;
    }
  });

  // Parse city/neighborhood from address
  if (result.address) {
    // Check for SF neighborhoods
    const sfNeighborhoods = [
      'Chinatown', 'Fishermans Wharf', 'Hayes Valley',
      'Mission', 'Richmond', 'Silver', 'Sunset',
    ];
    for (const n of sfNeighborhoods) {
      if (result.address.toLowerCase().includes(n.toLowerCase())) {
        result.neighborhood = n;
        break;
      }
    }
    // Check cities - order matters (South SF before SF)
    if (result.address.includes('South San Francisco')) {
      result.city = 'South San Francisco';
    } else if (result.address.includes('San Francisco')) {
      result.city = 'San Francisco';
    } else if (result.address.includes('San Mateo')) {
      result.city = 'San Mateo';
    } else if (result.address.includes('Daly City')) {
      result.city = 'Daly City';
    } else if (result.address.includes('Millbrae')) {
      result.city = 'Millbrae';
    } else if (result.address.includes('Napa')) {
      result.city = 'Napa';
    }
    result.state = 'CA';
    const zipMatch = result.address.match(/\b(9\d{4})\b/);
    if (zipMatch) result.zip = zipMatch[1];
  }

  // Social media links
  $('a[href*="facebook.com"]').each((_, el) => {
    if (!result.facebookUrl) result.facebookUrl = $(el).attr('href');
  });
  $('a[href*="instagram.com"]').each((_, el) => {
    if (!result.instagramUrl) result.instagramUrl = $(el).attr('href');
  });
  $('a[href*="yelp.com"]').each((_, el) => {
    if (!result.yelpUrl) result.yelpUrl = $(el).attr('href');
  });

  // === IMAGES ===
  const galleryUrls: string[] = [];

  // Business-specific logo (in images/logo/ directory, NOT logo3.png/logo4.png)
  $('img').each((_, img) => {
    const src = getImageSource($(img));
    if (src.includes('logo/') && !isGenericImage(src) && !result.logoUrl) {
      result.logoUrl = resolveUrl(src);
    }
  });

  // Gallery/poster images (in images/poster/ or images/adposter/ directory)
  $('img').each((_, img) => {
    const src = getImageSource($(img));
    if (!src || isGenericImage(src)) return;

    if (src.includes('poster/') || src.includes('adposter/')) {
      const resolved = resolveUrl(src);
      if (!galleryUrls.includes(resolved)) {
        galleryUrls.push(resolved);
      }
    }
  });

  // Also look for any other content images that aren't site chrome
  $('img').each((_, img) => {
    const src = getImageSource($(img));
    if (
      !src ||
      isGenericImage(src) ||
      src.includes('logo') ||
      src.includes('qrcode') ||
      src.includes('bk') ||
      src.includes('icon')
    )
      return;

    // Include upload images and other content images
    if (src.includes('upload') || src.includes('photo') || src.includes('image')) {
      const resolved = resolveUrl(src);
      if (!galleryUrls.includes(resolved)) {
        galleryUrls.push(resolved);
      }
    }
  });

  result.galleryUrls = galleryUrls;

  // Banner/background image
  $('img[src*="bk"], img[data-original*="bk"], img[data-src*="bk"], img[data-lazy*="bk"]').each((_, img) => {
    const src = getImageSource($(img));
    if (src && !isGenericImage(src) && !result.bannerUrl) {
      result.bannerUrl = resolveUrl(src);
    }
  });

  // QR code
  $('img[src*="qrcode"], img[src*="qr"], img[data-original*="qrcode"], img[data-original*="qr"], img[data-src*="qrcode"], img[data-src*="qr"], img[data-lazy*="qrcode"], img[data-lazy*="qr"]').each((_, img) => {
    const src = getImageSource($(img));
    if (src && !result.qrCodeUrl) {
      result.qrCodeUrl = resolveUrl(src);
    }
  });

  // Description - look for content text blocks
  // Try to find the about/description section text
  $('p, .about, .description, .intro').each((_, el) => {
    const text = $(el).text().trim();
    if (
      text &&
      text.length > 20 &&
      text.length < 2000 &&
      !isGenericName(text) &&
      !result.description
    ) {
      // Skip if it's just a nav/menu text
      if (!text.includes('Log in') && !text.includes('Promote')) {
        result.description = text.substring(0, 1000);
      }
    }
  });

  // Order URL
  $('a[href*="order"], a[href*="menu"], a[href*="toasttab"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href && !href.includes('shopdineguide') && !result.orderUrl) {
      result.orderUrl = href;
    }
  });

  result.fetchedAt = new Date().toISOString();
  return result;
}

async function main() {
  console.log('=== ShopDineGuide Content Scraper v2 ===\n');

  const sections = ['shop', 'dine', 'guide'];
  const allListings = new Map<string, ListingItem>();

  // Step 1: Fetch listing pages
  console.log('Step 1: Fetching listing pages...');
  for (const section of sections) {
    try {
      const html = await fetchPage(`${BASE_URL}/index.php?s=${section}`);
      const items = parseListingPage(html, section);
      items.forEach((item) => {
        const key = `${item.isAd ? 'ad' : ''}${item.id}`;
        allListings.set(key, item);
      });
      console.log(`  Found ${items.length} items in ${section}`);
      await delay(DELAY_MS);
    } catch (err) {
      console.error(`  Failed to fetch ${section}:`, err);
    }
  }

  // Also fetch hot, free, deals, coupons pages
  const filterPages = ['hot', 'free', 'deals', 'coupons'];
  for (const filter of filterPages) {
    try {
      const html = await fetchPage(`${BASE_URL}/index.php?s=${filter}`);
      const items = parseListingPage(html, 'dine');
      items.forEach((item) => {
        const key = `${item.isAd ? 'ad' : ''}${item.id}`;
        if (!allListings.has(key)) {
          allListings.set(key, item);
        }
      });
      console.log(`  Found ${items.length} items in ${filter} filter`);
      await delay(DELAY_MS);
    } catch (err) {
      console.error(`  Failed to fetch ${filter}:`, err);
    }
  }

  console.log(`\nTotal unique listings found: ${allListings.size}\n`);

  // Step 2: Fetch detail pages
  console.log('Step 2: Fetching detail pages...');
  const businesses: ScrapedBusiness[] = [];
  let count = 0;
  const total = allListings.size;

  for (const [key, listing] of allListings) {
    count++;
    try {
      const url = listing.isAd
        ? `${BASE_URL}/adshowpon.php?id=${listing.id}`
        : `${BASE_URL}/showpon.php?id=${listing.id}`;

      const html = await fetchPage(url);
      const detail = parseDetailPage(html, listing.id);

      // Determine best name: prefer detail page h2, fallback to listing name
      let name = detail.name || listing.name;
      if (isGenericName(name)) {
        name = listing.name;
      }
      if (isGenericName(name)) {
        name = `Business ${listing.id}`;
      }

      // Determine best poster image:
      // Priority: first gallery image > logo from detail > logo from listing
      const galleryUrls = detail.galleryUrls || [];
      let posterUrl = galleryUrls[0] || detail.logoUrl || listing.logoUrl || undefined;

      const business: ScrapedBusiness = {
        id: listing.id,
        name,
        section: listing.section,
        address: detail.address,
        city: detail.city,
        neighborhood: detail.neighborhood,
        state: detail.state || 'CA',
        zip: detail.zip,
        phone: detail.phone,
        website: detail.website,
        logoUrl: detail.logoUrl || listing.logoUrl || undefined,
        posterUrl,
        bannerUrl: detail.bannerUrl,
        qrCodeUrl: detail.qrCodeUrl,
        galleryUrls,
        googleMapsUrl: detail.googleMapsUrl,
        facebookUrl: detail.facebookUrl,
        instagramUrl: detail.instagramUrl,
        yelpUrl: detail.yelpUrl,
        description: detail.description,
        categories: [],
        likeCount: listing.likeCount,
        isHot: false,
        isFree: false,
        isAd: listing.isAd,
        orderUrl: detail.orderUrl,
        fetchedAt: new Date().toISOString(),
      };

      businesses.push(business);
      console.log(
        `  [${count}/${total}] ${business.name} (id=${listing.id}) - ${galleryUrls.length} images, poster: ${posterUrl ? 'YES' : 'NO'}`
      );
      await delay(DELAY_MS);
    } catch (err) {
      console.error(`  [${count}/${total}] Failed id=${listing.id}:`, err);
      businesses.push({
        id: listing.id,
        name: listing.name,
        section: listing.section,
        logoUrl: listing.logoUrl,
        posterUrl: listing.logoUrl,
        galleryUrls: [],
        categories: [],
        likeCount: listing.likeCount,
        isHot: false,
        isFree: false,
        isAd: listing.isAd,
        state: 'CA',
        fetchedAt: new Date().toISOString(),
      });
    }
  }

  // Step 3: Write output
  console.log('\nStep 3: Writing output...');
  const outputDir = path.join(__dirname, '..', 'assets', 'data');
  fs.mkdirSync(outputDir, { recursive: true });

  const output = {
    businesses,
    scrapedAt: new Date().toISOString(),
    total: businesses.length,
  };

  fs.writeFileSync(
    path.join(outputDir, 'businesses.json'),
    JSON.stringify(output, null, 2)
  );

  // Stats
  const withImages = businesses.filter((b) => b.posterUrl && !b.posterUrl.includes('poster0')).length;
  const withNames = businesses.filter((b) => b.name && !b.name.startsWith('Business ')).length;
  const withAddress = businesses.filter((b) => b.address).length;
  const withPhone = businesses.filter((b) => b.phone).length;

  console.log(`\n=== Results ===`);
  console.log(`Total: ${businesses.length}`);
  console.log(`With real images: ${withImages}`);
  console.log(`With names: ${withNames}`);
  console.log(`With address: ${withAddress}`);
  console.log(`With phone: ${withPhone}`);
  console.log(`\nWrote to assets/data/businesses.json`);
}

main().catch(console.error);
