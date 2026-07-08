import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { publishToX } from '@/lib/twitter';
import { publishToLinkedIn } from '@/lib/linkedin';

type PublishStatus = 'SUCCESS' | 'FAILED' | 'SIMULATED';
interface StatusLog { channel: string; status: PublishStatus; details: string }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, content, channels = [] } = body;

    if (!clientId || !content) {
      return NextResponse.json({ error: 'Missing required parameters (clientId, content)' }, { status: 400 });
    }

    const brandMemory = await prisma.brandMemory.findUnique({ where: { clientId } });
    const statusLogs: StatusLog[] = [];

    for (const ch of channels) {

      // ─── SLACK ────────────────────────────────────────────────────────────────
      if (ch === 'slack') {
        const webhookUrl = brandMemory?.slackWebhookUrl;
        if (webhookUrl) {
          try {
            const res = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: content, username: 'AgencyOS Publisher', icon_emoji: ':rocket:' }),
            });
            if (res.ok) {
              statusLogs.push({ channel: 'slack', status: 'SUCCESS', details: 'Message posted to Slack via Incoming Webhook.' });
            } else {
              statusLogs.push({ channel: 'slack', status: 'FAILED', details: `Slack API error: ${await res.text()}` });
            }
          } catch (err: any) {
            statusLogs.push({ channel: 'slack', status: 'FAILED', details: `Network error: ${err.message}` });
          }
        } else {
          statusLogs.push({ channel: 'slack', status: 'SIMULATED', details: 'No Slack webhook configured. Sandbox mode.' });
        }

      // ─── DISCORD ──────────────────────────────────────────────────────────────
      } else if (ch === 'discord') {
        const webhookUrl = brandMemory?.discordWebhookUrl;
        if (webhookUrl) {
          try {
            const res = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                content,
                username: 'AgencyOS Publisher',
                avatar_url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4e2.png',
              }),
            });
            if (res.status === 204 || res.ok) {
              statusLogs.push({ channel: 'discord', status: 'SUCCESS', details: 'Message posted to Discord via Webhook.' });
            } else {
              statusLogs.push({ channel: 'discord', status: 'FAILED', details: `Discord API error: ${await res.text()}` });
            }
          } catch (err: any) {
            statusLogs.push({ channel: 'discord', status: 'FAILED', details: `Network error: ${err.message}` });
          }
        } else {
          statusLogs.push({ channel: 'discord', status: 'SIMULATED', details: 'No Discord webhook configured. Sandbox mode.' });
        }

      // ─── CUSTOM WEBHOOK (Make.com / Zapier / n8n / any) ──────────────────────
      } else if (ch === 'custom') {
        const webhookUrl = brandMemory?.customWebhookUrl;
        if (webhookUrl) {
          try {
            const payload = {
              content,
              clientId,
              source: 'AgencyOS',
              timestamp: new Date().toISOString(),
              channel: 'custom',
            };
            const res = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            // Make.com returns 200, Zapier returns 200, n8n returns 200
            if (res.ok || res.status === 204) {
              statusLogs.push({ channel: 'custom', status: 'SUCCESS', details: 'Post delivered to Custom Webhook (Make.com / Zapier / n8n).' });
            } else {
              const text = await res.text();
              statusLogs.push({ channel: 'custom', status: 'FAILED', details: `Custom webhook error (${res.status}): ${text}` });
            }
          } catch (err: any) {
            statusLogs.push({ channel: 'custom', status: 'FAILED', details: `Network error sending to custom webhook: ${err.message}` });
          }
        } else {
          statusLogs.push({ channel: 'custom', status: 'SIMULATED', details: 'No Custom Webhook configured. Add a Make.com or Zapier URL in Integrations.' });
        }

      // ─── FACEBOOK (VIA WEBHOOK) ───────────────────────────────────────────────
      } else if (ch === 'facebook') {
        const webhookUrl = brandMemory?.customWebhookUrl;
        if (webhookUrl) {
          try {
            const payload = {
              content,
              clientId,
              source: 'AgencyOS',
              timestamp: new Date().toISOString(),
              channel: 'facebook',
            };
            const res = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (res.ok || res.status === 204) {
              statusLogs.push({ channel: 'facebook', status: 'SUCCESS', details: 'Post delivered to Facebook Webhook (Make.com/Zapier).' });
            } else {
              const text = await res.text();
              statusLogs.push({ channel: 'facebook', status: 'FAILED', details: `Facebook webhook error (${res.status}): ${text}` });
            }
          } catch (err: any) {
            statusLogs.push({ channel: 'facebook', status: 'FAILED', details: `Network error sending to Facebook webhook: ${err.message}` });
          }
        } else {
          statusLogs.push({ channel: 'facebook', status: 'SIMULATED', details: 'Sandbox simulated publish to FACEBOOK. Configure Custom Webhook in Integrations to enable real Facebook posting.' });
        }

      // ─── INSTAGRAM (VIA WEBHOOK) ──────────────────────────────────────────────
      } else if (ch === 'instagram') {
        const webhookUrl = brandMemory?.customWebhookUrl;
        if (webhookUrl) {
          try {
            const payload = {
              content,
              clientId,
              source: 'AgencyOS',
              timestamp: new Date().toISOString(),
              channel: 'instagram',
            };
            const res = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (res.ok || res.status === 204) {
              statusLogs.push({ channel: 'instagram', status: 'SUCCESS', details: 'Post delivered to Instagram Webhook (Make.com/Zapier).' });
            } else {
              const text = await res.text();
              statusLogs.push({ channel: 'instagram', status: 'FAILED', details: `Instagram webhook error (${res.status}): ${text}` });
            }
          } catch (err: any) {
            statusLogs.push({ channel: 'instagram', status: 'FAILED', details: `Network error sending to Instagram webhook: ${err.message}` });
          }
        } else {
          statusLogs.push({ channel: 'instagram', status: 'SIMULATED', details: 'Sandbox simulated publish to INSTAGRAM. Configure Custom Webhook in Integrations to enable real Instagram posting.' });
        }

      // ─── TELEGRAM ─────────────────────────────────────────────────────────────
      } else if (ch === 'telegram') {
        const token = brandMemory?.telegramToken;
        const chatId = brandMemory?.telegramChatId;
        if (token && chatId) {
          try {
            const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: chatId, text: content, parse_mode: 'HTML' }),
            });
            const data = await res.json();
            if (res.ok && data.ok) {
              statusLogs.push({ channel: 'telegram', status: 'SUCCESS', details: `Published to Telegram chat ID: ${chatId}` });
            } else {
              statusLogs.push({ channel: 'telegram', status: 'FAILED', details: `Telegram error: ${data.description || 'Unknown'}` });
            }
          } catch (err: any) {
            statusLogs.push({ channel: 'telegram', status: 'FAILED', details: `Network error: ${err.message}` });
          }
        } else {
          statusLogs.push({ channel: 'telegram', status: 'SIMULATED', details: 'No Telegram token/chatId configured.' });
        }

      // ─── X / TWITTER ──────────────────────────────────────────────────────────
      } else if (ch === 'twitter' || ch === 'x') {
        const consumerKey = brandMemory?.xConsumerKey;
        const consumerSecret = brandMemory?.xConsumerSecret;
        const accessToken = brandMemory?.xAccessToken;
        const accessTokenSecret = brandMemory?.xAccessTokenSecret;

        if (consumerKey && consumerSecret && accessToken && accessTokenSecret) {
          try {
            await publishToX(content, { consumerKey, consumerSecret, accessToken, accessTokenSecret });
            statusLogs.push({ channel: 'twitter', status: 'SUCCESS', details: 'Tweet posted to X via direct API.' });
          } catch (err: any) {
            statusLogs.push({ channel: 'twitter', status: 'FAILED', details: `X API error: ${err.message}` });
          }
        } else {
          statusLogs.push({ channel: 'twitter', status: 'SIMULATED', details: 'No X credentials configured. Sandbox mode.' });
        }

      // ─── LINKEDIN ─────────────────────────────────────────────────────────────
      } else if (ch === 'linkedin') {
        const accessToken = brandMemory?.linkedinAccessToken;
        const personId = brandMemory?.linkedinPersonId;

        if (accessToken) {
          try {
            await publishToLinkedIn(content, accessToken, personId || undefined);
            statusLogs.push({ channel: 'linkedin', status: 'SUCCESS', details: 'Message posted to LinkedIn via direct API.' });
          } catch (err: any) {
            statusLogs.push({ channel: 'linkedin', status: 'FAILED', details: `LinkedIn API error: ${err.message}` });
          }
        } else {
          statusLogs.push({ channel: 'linkedin', status: 'SIMULATED', details: 'No LinkedIn credentials configured. Sandbox mode.' });
        }

      // ─── EVERYTHING ELSE ──────────────────────────────────────────────────────
      } else {
        statusLogs.push({
          channel: ch,
          status: 'SIMULATED',
          details: `Sandbox simulated publish to ${ch.toUpperCase()}.`,
        });
      }
    }

    return NextResponse.json({ success: true, statusLogs });
  } catch (error: any) {
    console.error('Publish API Error:', error);
    return NextResponse.json({ error: 'Failed to process publication' }, { status: 500 });
  }
}
