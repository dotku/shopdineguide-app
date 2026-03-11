import * as SQLite from 'expo-sqlite';
import type { Business, ContentFilter } from '../types/business';

let db: SQLite.SQLiteDatabase | null = null;
const DB_VERSION = 2;

interface User {
  id: number;
  email: string;
  password: string;
  name?: string;
  phone?: string;
  avatar?: string;
  created_at: string;
  updated_at?: string;
}

export const database = {
  async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (db) return db;
    db = await SQLite.openDatabaseAsync('shopdineguide.db');
    await this.initialize();
    return db;
  },

  async initialize(): Promise<void> {
    if (!db) return;

    // 创建所有表
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

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        phone TEXT,
        avatar TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS db_version (
        version INTEGER PRIMARY KEY
      );

      CREATE INDEX IF NOT EXISTS idx_businesses_section ON businesses(section);
      CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
      CREATE INDEX IF NOT EXISTS idx_businesses_neighborhood ON businesses(neighborhood);
    `);


    const currentVersion = await this.getDbVersion();
    
    if (currentVersion < DB_VERSION) {
      console.log(`Upgrading database from version ${currentVersion} to ${DB_VERSION}`);
      await this.setDbVersion(DB_VERSION);
      console.log('Database upgrade completed');
    }
  },

  async getDbVersion(): Promise<number> {
    if (!db) return 0;
    try {
      const result = await db.getFirstAsync<{ version: number }>(
        'SELECT version FROM db_version LIMIT 1'
      );
      return result?.version ?? 0;
    } catch {
      return 0;
    }
  },

  async setDbVersion(version: number): Promise<void> {
    if (!db) return;
    await db.runAsync('DELETE FROM db_version');
    await db.runAsync('INSERT INTO db_version (version) VALUES (?)', [version]);
  },

    async seedFromBundle(data: { businesses: any[] }): Promise<number> {
    const database = await this.getDb();

    console.log('🌱 Seeding businesses...');
    
    // 检查重复 ID
    const ids = data.businesses.map(b => b.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    
    if (duplicateIds.length > 0) {
      console.warn('⚠️ Found duplicate business IDs:', [...new Set(duplicateIds)]);
    }

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
    
    console.log(`✅ Seeded ${upserted} businesses`);
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
    console.log('getBusinessById called with:', id);
    const database = await this.getDb();

    try {
      const result = await database.getFirstAsync<Business>(
        'SELECT * FROM businesses WHERE id = ?',
        [id]
      );
      console.log('getBusinessById result:', result ? 'found' : 'not found');
      return result || null;
    } catch (error) {
      console.error('getBusinessById error:', error);
      return null;
    }
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
      console.log(`Bookmark removed for business ${businessId}`);
      return false;
    } else {
      await database.runAsync(
        'INSERT OR IGNORE INTO bookmarks (businessId, createdAt) VALUES (?, ?)',
        [businessId, new Date().toISOString()]
      );
      console.log(`Bookmark added for business ${businessId}`);
      return true;
    }
  },

  async getBookmarkedBusinesses(): Promise<Business[]> {
    const database = await this.getDb();
    const results = await database.getAllAsync<Business>(
      `SELECT DISTINCT b.* FROM businesses b
      INNER JOIN bookmarks bk ON b.id = bk.businessId
      ORDER BY bk.createdAt DESC`
    );
    
    console.log(`Found ${results.length} bookmarked businesses`);
    return results;
  },

  async cleanupDuplicateBookmarks() {
    const database = await this.getDb();
    
    try {
      await database.execAsync(`
        DELETE FROM bookmarks 
        WHERE rowid NOT IN (
          SELECT MIN(rowid) 
          FROM bookmarks 
          GROUP BY businessId
        )
      `);
      
      const remaining = await database.getFirstAsync<{ cnt: number }>(
        'SELECT COUNT(*) as cnt FROM bookmarks'
      );
      
      console.log(`Cleaned up bookmarks. Remaining: ${remaining?.cnt || 0}`);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
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

    // ========== 认证方法 ==========

  async registerUser(email: string, password: string) {
    const database = await this.getDb();
    
    if (!email || !email.trim()) {
      return { success: false, error: 'Email is required' };
    }
    
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email format' };
    }
    
    const hashedPassword = btoa(password);
    
    try {
      const result = await database.runAsync(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email.toLowerCase().trim(), hashedPassword]
      );
      return { 
        success: true, 
        userId: result.lastInsertRowId 
      };
    } catch (error: any) {
      console.error('Register user error:', error);
      if (error.message?.includes('UNIQUE constraint failed')) {
        return { success: false, error: 'Email already exists' };
      }
      return { success: false, error: 'Registration failed' };
    }
  },

  async getUserByEmail(email: string) {
    const database = await this.getDb();
    try {
      return await database.getFirstAsync<User>(
        'SELECT id, email, created_at FROM users WHERE email = ?',
        [email.toLowerCase().trim()]
      );
    } catch (error) {
      console.error('Get user by email error:', error);
      return null;
    }
  },


  // 更新用户资料
  async updateUserProfile(userId: number, data: {
    name?: string;
    phone?: string;
    avatar?: string;
  }) {
    const database = await this.getDb();
    
    try {
      const updates: string[] = [];
      const params: any[] = [];
      
      if (data.name !== undefined) {
        updates.push('name = ?');
        params.push(data.name);
      }
      if (data.phone !== undefined) {
        updates.push('phone = ?');
        params.push(data.phone);
      }
      if (data.avatar !== undefined) {
        updates.push('avatar = ?');
        params.push(data.avatar);
      }
      
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      
      params.push(userId);
      
      await database.runAsync(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      
      // 获取更新后的用户信息
      const user = await database.getFirstAsync<User>(
        'SELECT id, email, name, phone, avatar, created_at FROM users WHERE id = ?',
        [userId]
      );
      
      return { success: true, user };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message || 'Update failed' };
    }
  },

  // 修改密码
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const database = await this.getDb();
    
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }
    
    try {
      // 验证旧密码
      const oldHashedPassword = btoa(oldPassword);
      const user = await database.getFirstAsync<User>(
        'SELECT * FROM users WHERE id = ? AND password = ?',
        [userId, oldHashedPassword]
      );
      
      if (!user) {
        return { success: false, error: 'Current password is incorrect' };
      }
      
      // 更新密码
      const newHashedPassword = btoa(newPassword);
      await database.runAsync(
        'UPDATE users SET password = ?, updated_at = ? WHERE id = ?',
        [newHashedPassword, new Date().toISOString(), userId]
      );
      
      return { success: true };
    } catch (error: any) {
      console.error('Change password error:', error);
      return { success: false, error: error.message || 'Password change failed' };
    }
  },

  // 生成密码重置令牌
  async createPasswordResetToken(email: string) {
    const database = await this.getDb();
    
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        return { success: false, error: 'Email not found' };
      }
      
      // 生成6位数字验证码
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15分钟后过期
      
      await database.runAsync(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, token, expiresAt]
      );
      
      console.log(`Password reset token for ${email}: ${token}`);
      
      return { success: true, token }; // 实际应用中应该发邮件，这里只是演示
    } catch (error: any) {
      console.error('Create reset token error:', error);
      return { success: false, error: 'Failed to create reset token' };
    }
  },

  // 验证密码重置令牌
  async verifyPasswordResetToken(email: string, token: string) {
    const database = await this.getDb();
    
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        return { success: false, error: 'Email not found' };
      }
      
      const resetToken = await database.getFirstAsync<any>(
        `SELECT * FROM password_reset_tokens 
        WHERE user_id = ? AND token = ? AND used = 0 AND expires_at > ?
        ORDER BY created_at DESC LIMIT 1`,
        [user.id, token, new Date().toISOString()]
      );
      
      if (!resetToken) {
        return { success: false, error: 'Invalid or expired token' };
      }
      
      return { success: true, userId: user.id, tokenId: resetToken.id };
    } catch (error: any) {
      console.error('Verify token error:', error);
      return { success: false, error: 'Token verification failed' };
    }
  },

  // 重置密码
  async resetPassword(email: string, token: string, newPassword: string) {
    const database = await this.getDb();
    
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    try {
      const verification = await this.verifyPasswordResetToken(email, token);
      if (!verification.success) {
        return verification;
      }
      
      // 添加类型检查
      if (!verification.userId) {
        return { success: false, error: 'Invalid user ID' };
      }
      
      const newHashedPassword = btoa(newPassword);
      
      // 更新密码
      await database.runAsync(
        'UPDATE users SET password = ?, updated_at = ? WHERE id = ?',
        [newHashedPassword, new Date().toISOString(), verification.userId]
      );
      
      // 同样修复 tokenId
      if (verification.tokenId) {
        await database.runAsync(
          'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
          [verification.tokenId]
        );
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Password reset failed' };
    }
  },

  // 更新 loginUser 返回更多用户信息
  async loginUser(email: string, password: string) {
    const database = await this.getDb();
    
    if (!email || !email.trim()) {
      return { success: false, error: 'Email is required' };
    }
    
    if (!password || !password.trim()) {
      return { success: false, error: 'Password is required' };
    }
    
    const hashedPassword = btoa(password);
    
    try {
      const result = await database.getFirstAsync<User>(
        'SELECT id, email, name, phone, avatar, created_at FROM users WHERE email = ? AND password = ?',
        [email.toLowerCase().trim(), hashedPassword]
      );
      
      if (result) {
        return { 
          success: true, 
          user: { 
            id: result.id, 
            email: result.email,
            name: result.name,
            phone: result.phone,
            avatar: result.avatar,
          } 
        };
      }
      return { success: false, error: 'Invalid email or password' };
    } catch (error: any) {
      console.error('Login user error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  },

    // 临时调试方法
  async debugBookmarks() {
    const database = await this.getDb();
    
    console.log('=== DATABASE DEBUG ===');
    
    // 查询所有书签
    const bookmarks = await database.getAllAsync<any>(
      'SELECT * FROM bookmarks ORDER BY createdAt DESC'
    );
    console.log('Raw bookmarks table:', bookmarks);
    
    // 查询关联的商户
    const bookmarkedBusinesses = await database.getAllAsync<any>(
      `SELECT b.id, b.name, bk.businessId, bk.createdAt
      FROM businesses b
      INNER JOIN bookmarks bk ON b.id = bk.businessId
      ORDER BY bk.createdAt DESC`
    );
    console.log('Bookmarked businesses:', bookmarkedBusinesses);
    
    // 检查是否有重复
    const duplicates = await database.getAllAsync<any>(
      `SELECT businessId, COUNT(*) as count
      FROM bookmarks
      GROUP BY businessId
      HAVING count > 1`
    );
    
    if (duplicates.length > 0) {
      console.error('⚠️ DUPLICATE BOOKMARKS FOUND:', duplicates);
    } else {
      console.log('✅ No duplicate bookmarks');
    }
  },
}
