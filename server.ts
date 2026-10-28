import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Server-side Gemini AI Client with required User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: AI Auto-Tagging, Face & Object Recognition for Media Assets
app.post('/api/ai/analyze-media', async (req, res) => {
  try {
    const { title, description, category, brand, imageBase64, mimeType } = req.body;

    const prompt = `You are the lead AI Vision Analyst for an enterprise Digital Asset Management (DAM) platform for Singha Brand World (Boon Rawd Brewery).
Analyze the given asset information (and image if provided). Return a JSON object strictly matching this schema:
{
  "detectedObjects": [
    {"label": "string", "confidence": number, "category": "Product | Brand Logo | Packaging | Environment | Merchandise"},
    ...
  ],
  "detectedFaces": {
    "count": number,
    "hasPeople": boolean,
    "expression": "string",
    "sceneContext": "string"
  },
  "autoTags": ["tag1", "tag2", ... 10 to 14 relevant tags in English and Thai],
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  "suggestedCategory": "Packaging" | "Campaign Imagery" | "Logos & Identity" | "POSM & Retail" | "Guidelines & Print",
  "suggestedBrand": "SINGHA" | "LEO" | "U BEER" | "BOON RAWD",
  "contentSummaryEn": "A concise 1-sentence description in English",
  "contentSummaryTh": "A concise 1-sentence description in Thai",
  "marketSuitability": "Dark Market Compliant" | "Standard Commercial" | "B2B Only"
}

Asset Title: ${title || 'Brand Asset'}
Existing Description: ${description || 'N/A'}
Specified Category: ${category || 'Unknown'}
Brand: ${brand || 'SINGHA'}

Ensure detected objects include relevant DAM beverage/brand entities such as Beer Bottle, Beer Can, Glassware, Foam, Singha Lion Emblem, Ice Bucket, POSM, Bar Counter, Coaster, etc., if applicable.
Return ONLY valid JSON.`;

    if (process.env.GEMINI_API_KEY) {
      let contents: any = prompt;
      if (imageBase64 && mimeType) {
        contents = {
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            { text: prompt },
          ],
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText.trim());
      return res.json({ success: true, analysis: parsed });
    } else {
      // Graceful smart fallback if key is not configured
      const fallbackAnalysis = generateFallbackAnalysis(title, category, brand);
      return res.json({ success: true, analysis: fallbackAnalysis, fallback: true });
    }
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    // Provide robust fallback so app never breaks
    const fallbackAnalysis = generateFallbackAnalysis(req.body.title, req.body.category, req.body.brand);
    return res.json({ success: true, analysis: fallbackAnalysis, fallback: true });
  }
});

// Endpoint: Natural Language Semantic Search with Gemini
app.post('/api/ai/natural-search', async (req, res) => {
  try {
    const { query, assets } = req.body;
    if (!query || !assets || !Array.isArray(assets)) {
      return res.status(400).json({ error: 'Missing query or assets' });
    }

    if (process.env.GEMINI_API_KEY) {
      const simplifiedAssets = assets.map((a: any) => ({
        id: a.id,
        title: a.title,
        brand: a.brand,
        category: a.category,
        tags: a.tags,
        objects: a.detectedObjects?.map((o: any) => o.label),
        hasPeople: a.detectedFaces?.hasPeople,
      }));

      const prompt = `You are a semantic search engine for a Digital Asset Management (DAM) system.
A user searched with natural language: "${query}".
The query may be in Thai, English, or mixed.

Here is the list of assets in the DAM catalog:
${JSON.stringify(simplifiedAssets)}

Evaluate how well each asset matches the user's intent (conceptual meaning, visual elements, setting, emotion, brand, objects).
Return a JSON array of matching assets ranked from highest relevance to lowest:
[
  {
    "id": "asset_id",
    "relevanceScore": number (0 to 100),
    "matchReasonEn": "Brief explanation why it matched",
    "matchReasonTh": "คำอธิบายสั้นๆ ภาษาไทยว่าทำไมถึงตรงกับคำค้นหา"
  }
]
Only include items with relevanceScore >= 40. Return ONLY valid JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text || '[]';
      const rankedMatches = JSON.parse(text.trim());
      return res.json({ success: true, matches: rankedMatches });
    } else {
      // Graceful semantic keyword fallback
      const matches = fallbackSemanticSearch(query, assets);
      return res.json({ success: true, matches, fallback: true });
    }
  } catch (error) {
    console.error('Natural Search Error:', error);
    const matches = fallbackSemanticSearch(req.body.query, req.body.assets || []);
    return res.json({ success: true, matches, fallback: true });
  }
});

// Fallback generator for analysis
function generateFallbackAnalysis(title: string = '', category: string = '', brand: string = 'SINGHA') {
  const isLifestyle = title.toLowerCase().includes('lifestyle') || title.toLowerCase().includes('toast') || category === 'Campaign Imagery';
  const isPackaging = title.toLowerCase().includes('can') || title.toLowerCase().includes('pack') || title.toLowerCase().includes('bottle');
  const isLogo = title.toLowerCase().includes('logo') || title.toLowerCase().includes('icon') || title.toLowerCase().includes('1933');

  if (isLifestyle) {
    return {
      detectedObjects: [
        { label: 'Beer Glass', confidence: 0.98, category: 'Product' },
        { label: 'Froth Foam', confidence: 0.94, category: 'Product' },
        { label: 'Teakwood Table', confidence: 0.91, category: 'Environment' },
        { label: 'City Skyline', confidence: 0.89, category: 'Environment' },
      ],
      detectedFaces: {
        count: 5,
        hasPeople: true,
        expression: 'Joyful & Celebrating',
        sceneContext: 'Rooftop social gathering in Bangkok golden hour',
      },
      autoTags: ['Cheers', 'Rooftop', 'Celebration', 'Friends', 'Draft Beer', 'Golden Glow', 'เพื่อน', 'ชนแก้ว', 'ฉลอง', 'สังสรรค์', 'ดาดฟ้า', 'แสงอบอุ่น'],
      dominantColors: ['#F5B800', '#2E1C0C', '#E5A93B'],
      suggestedCategory: 'Campaign Imagery',
      suggestedBrand: brand || 'SINGHA',
      contentSummaryEn: 'Group of young urban adults toasting cold golden beer glasses at sunset rooftop lounge.',
      contentSummaryTh: 'กลุ่มเพื่อนคนรุ่นใหม่ชนแก้วเบียร์สีทองเย็นฉ่ำบนรูฟท็อปบาร์ช่วงพระอาทิตย์ตกดิน',
      marketSuitability: 'Standard Commercial',
    };
  }

  if (isPackaging) {
    return {
      detectedObjects: [
        { label: 'Beer Can', confidence: 0.99, category: 'Packaging' },
        { label: 'Crushed Ice Cubes', confidence: 0.96, category: 'Environment' },
        { label: 'Water Condensation Droplets', confidence: 0.95, category: 'Product' },
        { label: 'Embossed Crest', confidence: 0.93, category: 'Brand Logo' },
      ],
      detectedFaces: { count: 0, hasPeople: false, expression: 'None', sceneContext: 'Studio Product Shot' },
      autoTags: ['Can', 'Ice Cold', 'Aluminum Packaging', 'Cold Brew', 'Gold Finish', 'Condensation', 'กระป๋อง', 'เย็นจัด', 'น้ำแข็ง', 'หยดน้ำ', 'สีทองหรู'],
      dominantColors: ['#F5B800', '#1A1A1A', '#E0F2FE'],
      suggestedCategory: 'Packaging',
      suggestedBrand: brand || 'SINGHA',
      contentSummaryEn: 'Studio commercial photography of golden beer can nestled in crystal ice with water droplets.',
      contentSummaryTh: 'ภาพถ่ายผลิตภัณฑ์กระป๋องเบียร์สีทองบนน้ำแข็งบดใสพร้อมหยดน้ำเย็นฉ่ำ',
      marketSuitability: 'Standard Commercial',
    };
  }

  return {
    detectedObjects: [
      { label: 'Singha Mythical Lion', confidence: 0.99, category: 'Brand Logo' },
      { label: 'ESTD 1933 Wordmark', confidence: 0.95, category: 'Brand Logo' },
      { label: 'Vector Artwork', confidence: 0.97, category: 'Brand Logo' },
    ],
    detectedFaces: { count: 0, hasPeople: false, expression: 'None', sceneContext: 'Vector Identity Asset' },
    autoTags: ['Master Logo', 'Heritage Lion', 'Boonrawd', 'Vector AI', 'Pantone 3559C', 'Brandmark', 'โลโก้หลัก', 'สิงห์ทอง', '1933', 'เวกเตอร์', 'อัตลักษณ์แบรนด์'],
    dominantColors: ['#F5B800', '#1A1A1A', '#FFFFFF'],
    suggestedCategory: 'Logos & Identity',
    suggestedBrand: brand || 'SINGHA',
    contentSummaryEn: 'Official Singha Brand World master logo emblem vector asset.',
    contentSummaryTh: 'ไฟล์เวกเตอร์ตราสัญลักษณ์สิงห์หลักอย่างเป็นทางการ Singha Brand World',
    marketSuitability: 'Dark Market Compliant',
  };
}

function fallbackSemanticSearch(query: string, assets: any[]) {
  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(Boolean);

  return assets
    .map((asset) => {
      let score = 0;
      const title = (asset.title || '').toLowerCase();
      const tags = (asset.tags || []).map((t: string) => t.toLowerCase());
      const category = (asset.category || '').toLowerCase();
      const brand = (asset.brand || '').toLowerCase();
      const desc = (asset.description || '').toLowerCase();
      const objects = (asset.detectedObjects || []).map((o: any) => (o.label || '').toLowerCase());

      // Thai keyword mappings
      const thaiConcepts: Record<string, string[]> = {
        'เบียร์': ['beer', 'can', 'bottle', 'draft'],
        'กระป๋อง': ['can', 'packaging', 'aluminum'],
        'ขวด': ['bottle', 'amber', 'glass'],
        'ชนแก้ว': ['toast', 'cheers', 'glass', 'friends'],
        'ปาร์ตี้': ['party', 'celebration', 'festival', 'crowd'],
        'เพื่อน': ['friends', 'people', 'lifestyle', 'toast'],
        'โลโก้': ['logo', 'icon', 'mark', 'brandmark'],
        'สิงห์': ['singha', 'lion', 'garuda'],
        'ลีโอ': ['leo'],
        'ทอง': ['gold', 'pantone 3559c', 'amber'],
        'น้ำแข็ง': ['ice', 'crushed ice', 'cold'],
        'ป้าย': ['signage', 'posm', 'coaster', 'display'],
        'คู่มือ': ['guideline', 'handbook', 'manual', 'rules'],
      };

      for (const token of tokens) {
        if (title.includes(token)) score += 35;
        if (tags.some((t: string) => t.includes(token))) score += 25;
        if (objects.some((o: string) => o.includes(token))) score += 30;
        if (category.includes(token)) score += 20;
        if (brand.includes(token)) score += 20;
        if (desc.includes(token)) score += 15;

        // Check thai concepts
        for (const [thKey, enSynonyms] of Object.entries(thaiConcepts)) {
          if (token.includes(thKey)) {
            for (const syn of enSynonyms) {
              if (title.includes(syn) || tags.some((t: string) => t.includes(syn)) || objects.some((o: string) => o.includes(syn))) {
                score += 25;
              }
            }
          }
        }
      }

      if (asset.detectedFaces?.hasPeople && (q.includes('คน') || q.includes('people') || q.includes('เพื่อน') || q.includes('friend') || q.includes('smile'))) {
        score += 30;
      }

      return {
        id: asset.id,
        relevanceScore: Math.min(100, Math.max(0, score)),
        matchReasonEn: `Matched semantic terms related to "${query}" in title, visual entities, and tags.`,
        matchReasonTh: `พบความสอดคล้องกับหัวข้อ วัตถุในภาพ และแท็กที่เกี่ยวข้องกับ "${query}"`,
      };
    })
    .filter((m) => m.relevanceScore >= 35)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// In-Memory Shared Links Store with TTL Expiration & Password
interface SharedLinkRecord {
  id: string;
  title: string;
  assetIds: string[];
  isPasswordProtected: boolean;
  password?: string;
  expiresAt: string;
  permissions: {
    canDownloadOriginal: boolean;
    canDownloadHighRes: boolean;
    allowWatermarkOnly: boolean;
  };
  recipientEmail?: string;
  creatorName: string;
  createdAt: string;
  viewsCount: number;
  downloadsCount: number;
  status: 'active' | 'expired' | 'revoked';
}

const sharedLinksDb = new Map<string, SharedLinkRecord>();

// Preseed an active shared link for seamless testing
sharedLinksDb.set('singha-campaign-q4', {
  id: 'singha-campaign-q4',
  title: 'Singha Global Brand Campaign & Packaging Pack',
  assetIds: ['asset-1', 'asset-2', 'asset-3', 'asset-4'],
  isPasswordProtected: true,
  password: 'singha-global',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  permissions: {
    canDownloadOriginal: true,
    canDownloadHighRes: true,
    allowWatermarkOnly: false,
  },
  recipientEmail: 'partner.agency@singhabrandworld.com',
  creatorName: 'Boon Rawd Regional Admin',
  createdAt: new Date().toISOString(),
  viewsCount: 14,
  downloadsCount: 5,
  status: 'active',
});

// Create Share Link
app.post('/api/shares/create', (req, res) => {
  const { title, assetIds, isPasswordProtected, password, expiresInHours, permissions, recipientEmail, creatorName } = req.body;
  if (!assetIds || assetIds.length === 0) {
    return res.status(400).json({ error: 'No assets selected for sharing' });
  }

  const id = `share-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const hours = Number(expiresInHours) || 168; // default 7 days
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

  const record: SharedLinkRecord = {
    id,
    title: title || 'Singha Brand Assets Collection',
    assetIds,
    isPasswordProtected: !!isPasswordProtected,
    password: isPasswordProtected ? String(password || '') : undefined,
    expiresAt,
    permissions: permissions || {
      canDownloadOriginal: true,
      canDownloadHighRes: true,
      allowWatermarkOnly: false,
    },
    recipientEmail: recipientEmail || '',
    creatorName: creatorName || 'Brand Administrator',
    createdAt: new Date().toISOString(),
    viewsCount: 0,
    downloadsCount: 0,
    status: 'active',
  };

  sharedLinksDb.set(id, record);
  return res.json({ success: true, share: record });
});

// Get Share Info
app.get('/api/shares/:id', (req, res) => {
  const record = sharedLinksDb.get(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Share link not found or has been removed' });
  }

  // Check if expired
  const now = new Date();
  const isExpired = new Date(record.expiresAt) < now || record.status === 'expired' || record.status === 'revoked';

  if (isExpired) {
    record.status = 'expired';
    return res.json({
      success: true,
      isExpired: true,
      share: {
        id: record.id,
        title: record.title,
        status: 'expired',
        expiresAt: record.expiresAt,
      },
    });
  }

  record.viewsCount += 1;

  // Don't leak raw password
  const safeRecord = {
    id: record.id,
    title: record.title,
    assetIds: record.assetIds,
    isPasswordProtected: record.isPasswordProtected,
    expiresAt: record.expiresAt,
    permissions: record.permissions,
    creatorName: record.creatorName,
    createdAt: record.createdAt,
    viewsCount: record.viewsCount,
    downloadsCount: record.downloadsCount,
    status: record.status,
  };

  return res.json({ success: true, isExpired: false, share: safeRecord });
});

// Verify Share Password
app.post('/api/shares/:id/verify', (req, res) => {
  const { password } = req.body;
  const record = sharedLinksDb.get(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Share link not found' });
  }

  if (!record.isPasswordProtected) {
    return res.json({ success: true, verified: true });
  }

  if (record.password === password) {
    return res.json({ success: true, verified: true });
  } else {
    return res.status(401).json({ success: false, verified: false, error: 'Incorrect passcode' });
  }
});

// Record Download Stat
app.post('/api/shares/:id/record-download', (req, res) => {
  const record = sharedLinksDb.get(req.params.id);
  if (record) {
    record.downloadsCount += 1;
    return res.json({ success: true, downloadsCount: record.downloadsCount });
  }
  return res.status(404).json({ error: 'Share link not found' });
});

// List All Shared Links
app.get('/api/shares', (req, res) => {
  const list = Array.from(sharedLinksDb.values()).map((r) => {
    const isExpired = new Date(r.expiresAt) < new Date();
    return {
      ...r,
      status: isExpired ? 'expired' : r.status,
      password: r.password ? '••••••••' : undefined,
    };
  });
  return res.json({ success: true, shares: list });
});

// Revoke Share Link
app.delete('/api/shares/:id', (req, res) => {
  const record = sharedLinksDb.get(req.params.id);
  if (record) {
    record.status = 'revoked';
    return res.json({ success: true, message: 'Share link revoked successfully' });
  }
  return res.status(404).json({ error: 'Share link not found' });
});

// Vite Middleware for Frontend Serving in Dev Mode
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  // Catch-all route to serve index.html for client-side routing (e.g. /collections, /share/:id)
  app.get('*', async (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    try {
      const url = req.originalUrl;
      const templatePath = path.resolve(process.cwd(), 'index.html');
      const template = fs.readFileSync(templatePath, 'utf-8');
      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      next(e);
    }
  });

  app.listen(PORT, () => {
    console.log(`Singha Brand World DAM server running on http://localhost:${PORT}`);
  });
}

startServer();
