import type { Business, ContentFilter } from '../types/business';

let businesses: Business[] = [];
const bookmarks = new Set<number>();

function matchLike(value: string | null | undefined, term: string): boolean {
  if (!value) return false;
  return value.toLowerCase().includes(term.toLowerCase());
}

export const database = {
  async getDb() {
    return null;
  },

  async seedFromBundle(data: { businesses: any[] }): Promise<number> {
    businesses = data.businesses.map((biz: any) => ({
      ...biz,
      galleryUrls: typeof biz.galleryUrls === 'string'
        ? biz.galleryUrls
        : JSON.stringify(biz.galleryUrls || []),
      hours: typeof biz.hours === 'string'
        ? biz.hours
        : JSON.stringify(biz.hours || null),
      categories: typeof biz.categories === 'string'
        ? biz.categories
        : JSON.stringify(biz.categories || []),
      likeCount: biz.likeCount || 0,
      isHot: biz.isHot ? 1 : 0,
      isFree: biz.isFree ? 1 : 0,
      isAd: biz.isAd ? 1 : 0,
    }));
    return businesses.length;
  },

  async getBusinessesBySection(
    section?: string,
    filter?: ContentFilter,
    city?: string,
    neighborhood?: string,
    category?: string,
    limit = 50,
    offset = 0
  ): Promise<Business[]> {
    let results = [...businesses];

    if (section) {
      results = results.filter((b) => b.section === section);
    }
    if (filter === 'hot') {
      results = results.filter((b) => b.isHot);
    } else if (filter === 'free') {
      results = results.filter((b) => b.isFree);
    }
    if (city) {
      results = results.filter((b) => b.city === city);
    }
    if (neighborhood) {
      results = results.filter((b) => b.neighborhood === neighborhood);
    }
    if (category) {
      results = results.filter(
        (b) => b.categories && String(b.categories).includes(category)
      );
    }

    results.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    return results.slice(offset, offset + limit);
  },

  async getBusinessById(id: number): Promise<Business | null> {
    return businesses.find((b) => b.id === id) || null;
  },

  async searchBusinesses(query: string, limit = 50): Promise<Business[]> {
    const term = query.toLowerCase();
    return businesses
      .filter(
        (b) =>
          matchLike(b.name, term) ||
          matchLike(b.address, term) ||
          matchLike(b.city, term) ||
          matchLike(b.description, term) ||
          matchLike(b.categories as any, term)
      )
      .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      .slice(0, limit);
  },

  async getHotBusinesses(limit = 20): Promise<Business[]> {
    return [...businesses]
      .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      .slice(0, limit);
  },

  async getBusinessesByCity(city: string, limit = 50): Promise<Business[]> {
    return businesses
      .filter((b) => b.city === city)
      .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      .slice(0, limit);
  },

  async isBookmarked(businessId: number): Promise<boolean> {
    return bookmarks.has(businessId);
  },

  async toggleBookmark(businessId: number): Promise<boolean> {
    if (bookmarks.has(businessId)) {
      bookmarks.delete(businessId);
      return false;
    }
    bookmarks.add(businessId);
    return true;
  },

  async getBookmarkedBusinesses(): Promise<Business[]> {
    return businesses.filter((b) => bookmarks.has(b.id));
  },

  async getTotalCount(): Promise<number> {
    return businesses.length;
  },

  async getSectionCount(section: string): Promise<number> {
    return businesses.filter((b) => b.section === section).length;
  },
};
