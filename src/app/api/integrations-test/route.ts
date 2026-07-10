import { NextResponse } from 'next/server';
import { publishToX } from '@/lib/twitter';
import { getLinkedInProfile } from '@/lib/linkedin';

function sanitizeUrlAndHeaders(url: string, baseHeaders: Record<string, string> = {}): { url: string; headers: Record<string, string> } {
  const headers = { ...baseHeaders };
  let cleanUrl = url;
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password) {
      const creds = `${parsed.username}:${parsed.password}`;
      headers['Authorization'] = `Basic ${Buffer.from(creds).toString('base64')}`;
      parsed.username = '';
      parsed.password = '';
      cleanUrl = parsed.toString();
    }
  } catch (e) {
    // ignore
  }
  return { url: cleanUrl, headers };
}

/**
 * POST /api/integrations-test
 * Tests a live connection for a given platform.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      platform,
      webhookUrl,
      token,
      chatId,
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret,
    } = body;

    if (!platform) {
      return NextResponse.json({ success: false, message: 'Platform is required.' }, { status: 400 });
    }

    // ── SLACK ────────────────────────────────────────────────────────────────────
    if (platform === 'slack') {
      if (!webhookUrl || !webhookUrl.startsWith('https://hooks.slack.com/')) {
        return NextResponse.json({ success: false, message: 'Invalid Slack webhook URL. Must start with https://hooks.slack.com/' });
      }
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '✅ *AgencyOS connected!* Slack integration is live.', username: 'AgencyOS Publisher', icon_emoji: ':rocket:' }),
      });
      return res.ok
        ? NextResponse.json({ success: true, message: 'Test message sent to Slack! Check your channel.' })
        : NextResponse.json({ success: false, message: `Slack rejected the request: ${await res.text()}` });
    }

    // ── DISCORD ──────────────────────────────────────────────────────────────────
    if (platform === 'discord') {
      if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
        return NextResponse.json({ success: false, message: 'Invalid Discord webhook URL. Must start with https://discord.com/api/webhooks/' });
      }
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '✅ **AgencyOS connected!** Discord integration is live.',
          username: 'AgencyOS Publisher',
          avatar_url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4e2.png',
        }),
      });
      return (res.status === 204 || res.ok)
        ? NextResponse.json({ success: true, message: 'Test message sent to Discord! Check your channel.' })
        : NextResponse.json({ success: false, message: `Discord rejected the request: ${await res.text()}` });
    }

    // ── CUSTOM WEBHOOK (Make.com / Zapier / n8n) ─────────────────────────────────
    if (platform === 'custom') {
      if (!webhookUrl) {
        return NextResponse.json({ success: false, message: 'Webhook URL is required.' });
      }
      try {
        const testPayload = {
          content: '✅ AgencyOS connection test successful! This webhook is live and ready to receive posts from AgencyOS.',
          message: '✅ AgencyOS connection test successful! This webhook is live and ready to receive posts from AgencyOS.',
          text: '✅ AgencyOS connection test successful! This webhook is live and ready to receive posts from AgencyOS.',
          source: 'AgencyOS',
          event: 'connection_test',
          timestamp: new Date().toISOString(),
        };
        const { url: cleanUrl, headers: cleanHeaders } = sanitizeUrlAndHeaders(webhookUrl, { 'Content-Type': 'application/json' });
        const res = await fetch(cleanUrl, {
          method: 'POST',
          headers: cleanHeaders,
          body: JSON.stringify(testPayload),
        });
        if (res.ok || res.status === 204) {
          return NextResponse.json({ success: true, message: 'Webhook triggered successfully! Check Make.com / Zapier / n8n for the incoming data.' });
        } else {
          const text = await res.text();
          return NextResponse.json({ success: false, message: `Webhook returned error (${res.status}): ${text}` });
        }
      } catch (err: any) {
        return NextResponse.json({ success: false, message: `Could not reach webhook URL: ${err.message}` });
      }
    }

    // ── TELEGRAM ─────────────────────────────────────────────────────────────────
    if (platform === 'telegram') {
      if (!token || !chatId) {
        return NextResponse.json({ success: false, message: 'Both Bot Token and Chat ID are required for Telegram.' });
      }
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: '✅ <b>AgencyOS connected!</b> Telegram is live.', parse_mode: 'HTML' }),
      });
      const data = await res.json();
      return (res.ok && data.ok)
        ? NextResponse.json({ success: true, message: 'Test message sent to Telegram!' })
        : NextResponse.json({ success: false, message: `Telegram error: ${data.description || 'Unknown'}` });
    }

    // ── X / TWITTER ──────────────────────────────────────────────────────────────
    if (platform === 'twitter' || platform === 'x') {
      if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
        return NextResponse.json({ success: false, message: 'All 4 X credentials are required.' });
      }
      try {
        await publishToX(
          `✅ Connection test: AgencyOS digital command center connected to X! [${new Date().toISOString()}]`,
          { consumerKey, consumerSecret, accessToken, accessTokenSecret }
        );
        return NextResponse.json({ success: true, message: 'Test Tweet posted to X! Check your profile.' });
      } catch (err: any) {
        return NextResponse.json({ success: false, message: `X API rejected the test: ${err.message}` });
      }
    }

    // ── LINKEDIN ─────────────────────────────────────────────────────────────────
    if (platform === 'linkedin') {
      if (!token) {
        return NextResponse.json({ success: false, message: 'LinkedIn Access Token is required.' });
      }
      try {
        const profile = await getLinkedInProfile(token);
        return NextResponse.json({
          success: true,
          message: `LinkedIn Connected successfully! Account: ${profile.name} (ID: ${profile.id})`,
          profile
        });
      } catch (err: any) {
        return NextResponse.json({ success: false, message: `LinkedIn authentication failed: ${err.message}` });
      }
    }

    return NextResponse.json({ success: false, message: `Unknown platform: ${platform}` }, { status: 400 });
  } catch (error: any) {
    console.error('Integration test error:', error);
    return NextResponse.json({ success: false, message: `Server error: ${error.message}` }, { status: 500 });
  }
}
