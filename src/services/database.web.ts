import type { Business, ContentFilter } from '../types/business';

let businesses: Business[] = [];
const bookmarks = new Set<number>();

// 用户存储
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

interface PasswordResetToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

let users: User[] = [];
let passwordResetTokens: PasswordResetToken[] = [];
let userIdCounter = 1;
let tokenIdCounter = 1;

function matchLike(value: string | null | undefined, term: string): boolean {
  if (!value) return false;
  return value.toLowerCase().includes(term.toLowerCase());
}

export const database = {
  async getDb() {
    return null;
  },

  async seedFromBundle(data: { businesses: any[] }): Promise<number> {
  console.log('🌱 Seeding businesses...');
  
  // 简单验证（不修复）
  const ids = data.businesses.map(b => b.id);
  const uniqueIds = new Set(ids);
  
  if (ids.length !== uniqueIds.size) {
    console.error('⚠️ WARNING: Source data still has duplicate IDs!');
    console.error('Run: node scripts/fix-duplicate-ids.js');
  }
  
  // 直接加载，不做任何 ID 修改
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
  
  console.log(`✅ Loaded ${businesses.length} businesses`);
  
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
    console.log(`🔖 Web: Toggle bookmark for business ${businessId}`);
    console.log('Before toggle, bookmarks:', Array.from(bookmarks));
    
    if (bookmarks.has(businessId)) {
      bookmarks.delete(businessId);
      console.log(`✅ Web: Removed bookmark ${businessId}`);
      console.log('After removal, bookmarks:', Array.from(bookmarks));
      return false;
    }
    
    bookmarks.add(businessId);
    console.log(`✅ Web: Added bookmark ${businessId}`);
    console.log('After addition, bookmarks:', Array.from(bookmarks));
    return true;
  },

  async getBookmarkedBusinesses(): Promise<Business[]> {
    console.log('📚 Web: Getting bookmarked businesses...');
    console.log('Web: Bookmark IDs:', Array.from(bookmarks));
    const results = businesses.filter((b) => bookmarks.has(b.id));
    console.log('=== WEB BOOKMARKS DEBUG ===');
    console.log('Total bookmarks:', results.length);
    console.log('Bookmark details:');
    results.forEach((b, index) => {
      console.log(`  ${index + 1}. ID: ${b.id}, Name: ${b.name}`);
    });
    
    // 检查重复
    const ids = results.map(b => b.id);
    const uniqueIds = [...new Set(ids)];
    
    if (ids.length !== uniqueIds.length) {
      console.error('⚠️ WEB: DUPLICATE IDS FOUND!');
      console.log('All IDs:', ids);
      console.log('Unique IDs:', uniqueIds);
    } else {
      console.log('✅ Web: No duplicate IDs');
    }
    console.log('===========================');


    return results;
  },

  async getTotalCount(): Promise<number> {
    return businesses.length;
  },

  async getSectionCount(section: string): Promise<number> {
    return businesses.filter((b) => b.section === section).length;
  },

  // ========== 认证方法 ==========

  async registerUser(email: string, password: string) {
    // 验证
    if (!email || !email.trim()) {
      return { success: false, error: 'Email is required' };
    }
    
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // 检查邮箱是否已存在
    if (users.find(u => u.email === normalizedEmail)) {
      return { success: false, error: 'Email already exists' };
    }
    
    // 简单的密码哈希
    const hashedPassword = btoa(password);
    
    const newUser: User = {
      id: userIdCounter++,
      email: normalizedEmail,
      password: hashedPassword,
      created_at: new Date().toISOString(),
    };
    
    users.push(newUser);
    
    console.log('Web: User registered:', normalizedEmail);
    return { 
      success: true, 
      userId: newUser.id 
    };
  },

  async loginUser(email: string, password: string) {
    // 验证
    if (!email || !email.trim()) {
      return { success: false, error: 'Email is required' };
    }
    
    if (!password || !password.trim()) {
      return { success: false, error: 'Password is required' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hashedPassword = btoa(password);
    
    const user = users.find(
      u => u.email === normalizedEmail && u.password === hashedPassword
    );
    
    if (user) {
      console.log('Web: User logged in:', normalizedEmail);
      return { 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
        } 
      };
    }
    
    return { success: false, error: 'Invalid email or password' };
  },

  async getUserByEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = users.find(u => u.email === normalizedEmail);
    
    if (user) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        created_at: user.created_at,
      };
    }
    
    return null;
  },

  // 更新用户资料
  async updateUserProfile(userId: number, data: {
    name?: string;
    phone?: string;
    avatar?: string;
  }) {
    try {
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }

      const user = users[userIndex];
      
      if (data.name !== undefined) {
        user.name = data.name;
      }
      if (data.phone !== undefined) {
        user.phone = data.phone;
      }
      if (data.avatar !== undefined) {
        user.avatar = data.avatar;
      }
      
      user.updated_at = new Date().toISOString();
      
      console.log('Web: Profile updated for user:', user.email);
      
      return { 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
          created_at: user.created_at,
        }
      };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message || 'Update failed' };
    }
  },

  // 修改密码
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }
    
    try {
      const oldHashedPassword = btoa(oldPassword);
      const user = users.find(u => u.id === userId && u.password === oldHashedPassword);
      
      if (!user) {
        return { success: false, error: 'Current password is incorrect' };
      }
      
      const newHashedPassword = btoa(newPassword);
      user.password = newHashedPassword;
      user.updated_at = new Date().toISOString();
      
      console.log('Web: Password changed for user:', user.email);
      return { success: true };
    } catch (error: any) {
      console.error('Change password error:', error);
      return { success: false, error: error.message || 'Password change failed' };
    }
  },

  // 生成密码重置令牌
  async createPasswordResetToken(email: string) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        return { success: false, error: 'Email not found' };
      }
      
      // 生成6位数字验证码
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15分钟后过期
      
      const resetToken: PasswordResetToken = {
        id: tokenIdCounter++,
        user_id: user.id,
        token,
        expires_at: expiresAt,
        used: false,
        created_at: new Date().toISOString(),
      };
      
      passwordResetTokens.push(resetToken);
      
      console.log(`Web: Password reset token for ${email}: ${token}`);
      
      return { success: true, token }; // 实际应用中应该发邮件
    } catch (error: any) {
      console.error('Create reset token error:', error);
      return { success: false, error: 'Failed to create reset token' };
    }
  },

  // 验证密码重置令牌
  async verifyPasswordResetToken(email: string, token: string) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        return { success: false, error: 'Email not found' };
      }
      
      const now = new Date().toISOString();
      const resetToken = passwordResetTokens
        .filter(t => t.user_id === user.id && t.token === token && !t.used && t.expires_at > now)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
      
      if (!resetToken) {
        return { success: false, error: 'Invalid or expired token' };
      }
      
      return { success: true, userId: user.id, tokenId: resetToken.id };
    } catch (error: any) {
      console.error('Verify token error:', error);
      return { success: false, error: 'Token verification failed' };
    }
  },

  async resetPassword(email: string, token: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    try {
      const verification = await this.verifyPasswordResetToken(email, token);
      if (!verification.success) {
        return verification;
      }
      
      // TypeScript 现在知道这些字段存在
      const user = users.find(u => u.id === verification.userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }
      
      const newHashedPassword = btoa(newPassword);
      user.password = newHashedPassword;
      user.updated_at = new Date().toISOString();
      
      // 标记令牌为已使用
      const resetToken = passwordResetTokens.find(t => t.id === verification.tokenId);
      if (resetToken) {
        resetToken.used = true;
      }
      
      console.log('Web: Password reset for user:', user.email);
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Password reset failed' };
    }
  },
};