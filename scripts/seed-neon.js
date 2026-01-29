#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const client = await pool.connect();

  try {
    console.log('Connected to Neon database');

    // Create businesses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        section TEXT,
        address TEXT,
        city TEXT,
        neighborhood TEXT,
        state TEXT,
        zip TEXT,
        phone TEXT,
        website TEXT,
        logo_url TEXT,
        poster_url TEXT,
        banner_url TEXT,
        qr_code_url TEXT,
        gallery_urls JSONB,
        google_maps_url TEXT,
        facebook_url TEXT,
        instagram_url TEXT,
        yelp_url TEXT,
        description TEXT,
        hours JSONB,
        categories JSONB,
        like_count INTEGER DEFAULT 0,
        is_hot BOOLEAN DEFAULT FALSE,
        is_free BOOLEAN DEFAULT FALSE,
        is_ad BOOLEAN DEFAULT FALSE,
        order_url TEXT,
        fetched_at TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table created/verified');

    // Load businesses data
    const dataPath = path.join(__dirname, '../assets/data/businesses.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const { businesses } = JSON.parse(rawData);

    console.log(`Found ${businesses.length} businesses to seed`);

    // Insert businesses
    let inserted = 0;
    let updated = 0;

    for (const biz of businesses) {
      const galleryUrls = Array.isArray(biz.galleryUrls) ? biz.galleryUrls : [];
      const categories = Array.isArray(biz.categories) ? biz.categories : [];

      const result = await client.query(`
        INSERT INTO businesses (
          id, name, section, address, city, neighborhood, state, zip,
          phone, website, logo_url, poster_url, banner_url, qr_code_url,
          gallery_urls, google_maps_url, facebook_url, instagram_url, yelp_url,
          description, hours, categories, like_count, is_hot, is_free, is_ad,
          order_url, fetched_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, $26,
          $27, $28, CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          section = EXCLUDED.section,
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          neighborhood = EXCLUDED.neighborhood,
          state = EXCLUDED.state,
          zip = EXCLUDED.zip,
          phone = EXCLUDED.phone,
          website = EXCLUDED.website,
          logo_url = EXCLUDED.logo_url,
          poster_url = EXCLUDED.poster_url,
          banner_url = EXCLUDED.banner_url,
          qr_code_url = EXCLUDED.qr_code_url,
          gallery_urls = EXCLUDED.gallery_urls,
          google_maps_url = EXCLUDED.google_maps_url,
          facebook_url = EXCLUDED.facebook_url,
          instagram_url = EXCLUDED.instagram_url,
          yelp_url = EXCLUDED.yelp_url,
          description = EXCLUDED.description,
          hours = EXCLUDED.hours,
          categories = EXCLUDED.categories,
          like_count = EXCLUDED.like_count,
          is_hot = EXCLUDED.is_hot,
          is_free = EXCLUDED.is_free,
          is_ad = EXCLUDED.is_ad,
          order_url = EXCLUDED.order_url,
          fetched_at = EXCLUDED.fetched_at,
          updated_at = CURRENT_TIMESTAMP
        RETURNING (xmax = 0) AS inserted
      `, [
        biz.id,
        biz.name,
        biz.section || null,
        biz.address || null,
        biz.city || null,
        biz.neighborhood || null,
        biz.state || null,
        biz.zip || null,
        biz.phone || null,
        biz.website || null,
        biz.logoUrl || null,
        biz.posterUrl || null,
        biz.bannerUrl || null,
        biz.qrCodeUrl || null,
        JSON.stringify(galleryUrls),
        biz.googleMapsUrl || null,
        biz.facebookUrl || null,
        biz.instagramUrl || null,
        biz.yelpUrl || null,
        biz.description || null,
        biz.hours ? JSON.stringify(biz.hours) : null,
        JSON.stringify(categories),
        biz.likeCount || 0,
        biz.isHot || false,
        biz.isFree || false,
        biz.isAd || false,
        biz.orderUrl || null,
        biz.fetchedAt || null
      ]);

      if (result.rows[0].inserted) {
        inserted++;
      } else {
        updated++;
      }
    }

    console.log(`\nSeeding complete!`);
    console.log(`  Inserted: ${inserted}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Total: ${businesses.length}`);

    // Verify count
    const countResult = await client.query('SELECT COUNT(*) FROM businesses');
    console.log(`\nTotal records in database: ${countResult.rows[0].count}`);

  } catch (err) {
    console.error('Error seeding database:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
