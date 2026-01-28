import * as SQLite from 'expo-sqlite';
import type { Business, ContentFilter } from '../types/business';

let db: SQLite.SQLiteDatabase | null = null;

export const database = {
  async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (db) return db;
    db = await SQLite.openDatabaseAsync('shopdineguide.db');
    await this.initialize();
    return db;
  },

  async initialize(): Promise<void> {
    if (!db) return;

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS businesses (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        section TEXT NOT NULL,
        address TEXT,
        city TEXT,
        neighborhood TEXT,
        state TEXT DEFAULT 'CA',
        zip TEXT,
        phone TEXT,
        website TEXT,
        email TEXT,
        logoUrl TEXT,
        posterUrl TEXT,
        bannerUrl TEXT,
        qrCodeUrl TEXT,
        galleryUrls TEXT,
        googleMapsUrl TEXT,
        facebookUrl TEXT,
        instagramUrl TEXT,
        yelpUrl TEXT,
        description TEXT,
        hours TEXT,
        categories TEXT,
        likeCount INTEGER DEFAULT 0,
        isHot INTEGER DEFAULT 0,
        isFree INTEGER DEFAULT 0,
        isAd INTEGER DEFAULT 0,
        orderUrl TEXT,
        fetchedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS deals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        businessId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        discountText TEXT,
        expiryDate TEXT,
        terms TEXT,
        imageUrl TEXT,
        fetchedAt TEXT,
        FOREIGN KEY (businessId) REFERENCES businesses(id)
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        businessId INTEGER PRIMARY KEY,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (businessId) REFERENCES businesses(id)
      );

      CREATE INDEX IF NOT EXISTS idx_businesses_section ON businesses(section);
      CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
      CREATE INDEX IF NOT EXISTS idx_businesses_neighborhood ON businesses(neighborhood);
    `);
  },

  async seedFromBundle(data: { businesses: any[] }): Promise<number> {
    const database = await this.getDb();

    let upserted = 0;
    for (const biz of data.businesses) {
      try {
        await database.runAsync(
          `INSERT OR REPLACE INTO businesses
           (id, name, section, address, city, neighborhood, state, zip,
            phone, website, logoUrl, posterUrl, bannerUrl, qrCodeUrl,
            galleryUrls, googleMapsUrl, facebookUrl, instagramUrl, yelpUrl,
            description, hours, categories, likeCount, isHot, isFree, isAd,
            orderUrl, fetchedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            biz.id,
            biz.name,
            biz.section,
            biz.address || null,
            biz.city || null,
            biz.neighborhood || null,
            biz.state || 'CA',
            biz.zip || null,
            biz.phone || null,
            biz.website || null,
            biz.logoUrl || null,
            biz.posterUrl || null,
            biz.bannerUrl || null,
            biz.qrCodeUrl || null,
            JSON.stringify(biz.galleryUrls || []),
            biz.googleMapsUrl || null,
            biz.facebookUrl || null,
            biz.instagramUrl || null,
            biz.yelpUrl || null,
            biz.description || null,
            JSON.stringify(biz.hours || null),
            JSON.stringify(biz.categories || []),
            biz.likeCount || 0,
            biz.isHot ? 1 : 0,
            biz.isFree ? 1 : 0,
            biz.isAd ? 1 : 0,
            biz.orderUrl || null,
            biz.fetchedAt || new Date().toISOString(),
          ]
        );
        upserted++;
      } catch (err) {
        console.warn(`Failed to upsert business ${biz.id}:`, err);
      }
    }
    return upserted;
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
    const database = await this.getDb();
    let query = 'SELECT * FROM businesses WHERE 1=1';
    const params: any[] = [];

    if (section) {
      query += ' AND section = ?';
      params.push(section);
    }
    if (filter === 'hot') {
      query += ' AND isHot = 1';
    } else if (filter === 'free') {
      query += ' AND isFree = 1';
    }
    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }
    if (neighborhood) {
      query += ' AND neighborhood = ?';
      params.push(neighborhood);
    }
    if (category) {
      query += ' AND categories LIKE ?';
      params.push(`%${category}%`);
    }
    query += ' ORDER BY likeCount DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return database.getAllAsync<Business>(query, params);
  },

  async getBusinessById(id: number): Promise<Business | null> {
    const database = await this.getDb();
    return database.getFirstAsync<Business>(
      'SELECT * FROM businesses WHERE id = ?',
      [id]
    );
  },

  async searchBusinesses(query: string, limit = 50): Promise<Business[]> {
    const database = await this.getDb();
    const term = `%${query}%`;
    return database.getAllAsync<Business>(
      `SELECT * FROM businesses
       WHERE name LIKE ? OR address LIKE ? OR city LIKE ? OR description LIKE ? OR categories LIKE ?
       ORDER BY likeCount DESC
       LIMIT ?`,
      [term, term, term, term, term, limit]
    );
  },

  async getHotBusinesses(limit = 20): Promise<Business[]> {
    const database = await this.getDb();
    return database.getAllAsync<Business>(
      'SELECT * FROM businesses ORDER BY likeCount DESC LIMIT ?',
      [limit]
    );
  },

  async getBusinessesByCity(city: string, limit = 50): Promise<Business[]> {
    const database = await this.getDb();
    return database.getAllAsync<Business>(
      'SELECT * FROM businesses WHERE city = ? ORDER BY likeCount DESC LIMIT ?',
      [city, limit]
    );
  },

  async isBookmarked(businessId: number): Promise<boolean> {
    const database = await this.getDb();
    const result = await database.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM bookmarks WHERE businessId = ?',
      [businessId]
    );
    return (result?.cnt ?? 0) > 0;
  },

  async toggleBookmark(businessId: number): Promise<boolean> {
    const database = await this.getDb();
    const bookmarked = await this.isBookmarked(businessId);
    if (bookmarked) {
      await database.runAsync('DELETE FROM bookmarks WHERE businessId = ?', [
        businessId,
      ]);
      return false;
    } else {
      await database.runAsync(
        'INSERT INTO bookmarks (businessId, createdAt) VALUES (?, ?)',
        [businessId, new Date().toISOString()]
      );
      return true;
    }
  },

  async getBookmarkedBusinesses(): Promise<Business[]> {
    const database = await this.getDb();
    return database.getAllAsync<Business>(
      `SELECT b.* FROM businesses b
       INNER JOIN bookmarks bk ON b.id = bk.businessId
       ORDER BY bk.createdAt DESC`
    );
  },

  async getTotalCount(): Promise<number> {
    const database = await this.getDb();
    const result = await database.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM businesses'
    );
    return result?.cnt ?? 0;
  },

  async getSectionCount(section: string): Promise<number> {
    const database = await this.getDb();
    const result = await database.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM businesses WHERE section = ?',
      [section]
    );
    return result?.cnt ?? 0;
  },
};
