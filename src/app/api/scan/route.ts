import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import { supabase } from '@/lib/supabase';
import { detectRisk } from '@/lib/keywords';

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

export async function POST(req: NextRequest) {
  try {
    const { username, email } = await req.json();

    if (!username || !email) {
      return NextResponse.json(
        { error: 'Username dan email wajib diisi' },
        { status: 400 }
      );
    }

    const cleanUsername = username.replace('@', '').trim();

    // ── 1. Upsert monitored_accounts ──────────────────────────────
    const { data: account, error: upsertError } = await supabase
      .from('monitored_accounts')
      .upsert(
        { instagram_username: cleanUsername, parent_email: email },
        { onConflict: 'instagram_username,parent_email' }
      )
      .select()
      .single();

    if (upsertError || !account) {
      return NextResponse.json(
        { error: 'Gagal menyimpan akun', detail: upsertError?.message },
        { status: 500 }
      );
    }

    const accountId: string = account.id;

    // ── 2. Actor 1: Ambil 5 post terbaru dari profil ──────────────
    console.log('[scan] Fetching posts for:', cleanUsername);

    const profileRun = await client.actor('apify/instagram-scraper').call({
      directUrls: [`https://www.instagram.com/${cleanUsername}/`],
      resultsType: 'posts',
      resultsLimit: 5,
    });

    const { items: posts } = await client
      .dataset(profileRun.defaultDatasetId)
      .listItems();

    console.log('[scan] Posts found:', posts.length);

    if (!posts || posts.length === 0) {
      return NextResponse.json(
        { error: 'Akun Instagram tidak ditemukan atau bersifat privat' },
        { status: 404 }
      );
    }

    // ── 3. Kumpulkan URL post ─────────────────────────────────────
    const postUrls = posts
      .map((p: any) => {
        if (p.url) return p.url;
        if (p.shortCode) return `https://www.instagram.com/p/${p.shortCode}/`;
        return null;
      })
      .filter(Boolean) as string[];

    console.log('[scan] Post URLs:', postUrls);

    if (postUrls.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada post publik yang ditemukan' },
        { status: 404 }
      );
    }

    // ── 4. Actor 2: Scrape komentar dari URL post ─────────────────
    console.log('[scan] Fetching comments...');

    const commentRun = await client.actor('apify/instagram-scraper').call({
      directUrls: postUrls,
      resultsType: 'comments',
      resultsLimit: 100,
    });

    const { items: comments } = await client
      .dataset(commentRun.defaultDatasetId)
      .listItems();

    console.log('[scan] Comments found:', comments.length);

    if (!comments || comments.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada komentar publik yang ditemukan' },
        { status: 404 }
      );
    }

    // ── 5. Deteksi risiko ─────────────────────────────────────────
    const flagged = [];

    for (const comment of comments) {
      const text = (comment.text || comment.previewCommentText) as string;
      if (!text) continue;

      const { level, detectedWords } = detectRisk(text);
      if (level !== 'Aman') {
        flagged.push({
          account_id: accountId,
          commenter_username: (comment.ownerUsername as string) || 'unknown',
          comment_text: text,
          post_url: (comment.postUrl || comment.url || '') as string,
          detected_words: detectedWords,
          risk_level: level,
        });
      }
    }

    console.log('[scan] Flagged:', flagged.length);

    // ── 6. Simpan flagged comments ────────────────────────────────
    if (flagged.length > 0) {
      const { error: insertError } = await supabase
        .from('flagged_comments')
        .insert(flagged);

      if (insertError) {
        console.error('[scan] Insert flagged error:', insertError.message);
      }
    }

    // ── 7. Update last_scanned_at ─────────────────────────────────
    await supabase
      .from('monitored_accounts')
      .update({ last_scanned_at: new Date().toISOString() })
      .eq('id', accountId);

    // ── 8. Return ─────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      accountId,
      totalScanned: comments.length,
      flaggedCount: flagged.length,
      flaggedComments: flagged.map((f, idx) => ({
        id: idx + 1,
        commenter: f.commenter_username,
        text: f.comment_text,
        postUrl: f.post_url,
        detectedWords: f.detected_words,
        riskLevel: f.risk_level,
      })),
      overallRisk:
        flagged.some((f) => f.risk_level === 'Berbahaya') ? 'Tinggi'
        : flagged.length > 0 ? 'Sedang'
        : 'Aman',
    });

  } catch (error: any) {
    console.error('[scan] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan', detail: error.toString() },
      { status: 500 }
    );
  }
}