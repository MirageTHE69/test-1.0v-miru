import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { publishToLinkedIn } from '@/lib/linkedin';

function extractPostText(payload: any, template?: string): string {
  if (template) {
    // Interpolate placeholders like {field_name}
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return payload[key] !== undefined ? String(payload[key]) : match;
    });
  }
  
  return (
    payload.post_text ||
    payload.message ||
    payload.content ||
    payload.text ||
    payload.body ||
    (typeof payload === 'string' ? payload : JSON.stringify(payload))
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  let flowIdForLog: string | null = null;
  let payloadStr = '';
  
  try {
    const resolvedParams = await (params as any);
    const id = resolvedParams.id;

    // Read payload
    let payload: any = {};
    try {
      payload = await request.json();
    } catch {
      // Fallback if not JSON
    }
    payloadStr = JSON.stringify(payload);

    // Find automation flow by webhookPath
    const flow = await prisma.automationFlow.findFirst({
      where: {
        OR: [
          { webhookPath: id },
          { webhookPath: `flow-${id}` }
        ]
      },
      include: {
        client: true
      }
    });

    if (!flow) {
      return NextResponse.json({ error: 'Automation flow not found' }, { status: 404 });
    }

    flowIdForLog = flow.id;

    if (!flow.isActive) {
      // Flow is inactive, do not execute
      await prisma.automationLog.create({
        data: {
          flowId: flow.id,
          payload: payloadStr,
          status: 'FAILED',
          details: 'Trigger skipped because the automation flow is disabled/inactive.',
        }
      });
      return NextResponse.json({ success: false, message: 'Flow is inactive' });
    }

    // Retrieve client brand memory connections
    const brandMemory = await prisma.brandMemory.findUnique({
      where: { clientId: flow.clientId }
    });

    // Parse actions
    let actions: any[] = [];
    try {
      actions = JSON.parse(flow.actions || '[]');
    } catch {
      // ignore
    }

    const actionResults: string[] = [];
    let flowSuccess = true;

    for (const act of actions) {
      const type = (act.type || '').toUpperCase();
      const config = act.config || {};
      const postText = extractPostText(payload, config.template);

      // ─── LINKEDIN ACTION ───────────────────────────────────────────────────
      if (type === 'LINKEDIN') {
        const token = brandMemory?.linkedinAccessToken;
        const personId = brandMemory?.linkedinPersonId;

        if (token) {
          try {
            await publishToLinkedIn(postText, token, personId || undefined);
            actionResults.push('LinkedIn: Successfully published text post.');
          } catch (err: any) {
            flowSuccess = false;
            actionResults.push(`LinkedIn Error: ${err.message}`);
          }
        } else {
          // Simulated sandbox fallback
          actionResults.push(`LinkedIn (Simulated): Posted text: "${postText}"`);
        }
      }

      // ─── SLACK ACTION ──────────────────────────────────────────────────────
      else if (type === 'SLACK') {
        const webhookUrl = brandMemory?.slackWebhookUrl;
        if (webhookUrl) {
          try {
            const res = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: postText, username: 'AgencyOS Hook Bot' })
            });
            if (res.ok) {
              actionResults.push('Slack: Posted notification via Webhook.');
            } else {
              flowSuccess = false;
              actionResults.push(`Slack Error: API status ${res.status}`);
            }
          } catch (err: any) {
            flowSuccess = false;
            actionResults.push(`Slack Error: ${err.message}`);
          }
        } else {
          actionResults.push(`Slack (Simulated): Posted text: "${postText}"`);
        }
      }

      // ─── DISCORD ACTION ────────────────────────────────────────────────────
      else if (type === 'DISCORD') {
        const webhookUrl = brandMemory?.discordWebhookUrl;
        if (webhookUrl) {
          try {
            const res = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: postText, username: 'AgencyOS Hook Bot' })
            });
            if (res.ok || res.status === 204) {
              actionResults.push('Discord: Posted notification via Webhook.');
            } else {
              flowSuccess = false;
              actionResults.push(`Discord Error: API status ${res.status}`);
            }
          } catch (err: any) {
            flowSuccess = false;
            actionResults.push(`Discord Error: ${err.message}`);
          }
        } else {
          actionResults.push(`Discord (Simulated): Posted text: "${postText}"`);
        }
      }

      // ─── CUSTOM WEBHOOK ACTION ─────────────────────────────────────────────
      else if (type === 'CUSTOM') {
        const webhookUrl = brandMemory?.customWebhookUrl;
        if (webhookUrl) {
          try {
            const res = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: 'automation_trigger',
                flowName: flow.name,
                text: postText,
                rawPayload: payload
              })
            });
            if (res.ok) {
              actionResults.push('Custom Webhook: Successfully forwarded trigger.');
            } else {
              flowSuccess = false;
              actionResults.push(`Custom Webhook Error: Status ${res.status}`);
            }
          } catch (err: any) {
            flowSuccess = false;
            actionResults.push(`Custom Webhook Error: ${err.message}`);
          }
        } else {
          actionResults.push(`Custom Webhook (Simulated): Forwarded text: "${postText}"`);
        }
      }
    }

    // Save log entry
    await prisma.automationLog.create({
      data: {
        flowId: flow.id,
        payload: payloadStr,
        status: flowSuccess ? 'SUCCESS' : 'FAILED',
        details: actionResults.join(' | '),
      }
    });

    return NextResponse.json({
      success: flowSuccess,
      message: flowSuccess ? 'Automation trigger executed successfully' : 'Trigger executed with errors',
      details: actionResults
    });

  } catch (error: any) {
    console.error('Webhook execution failure:', error);
    
    if (flowIdForLog) {
      await prisma.automationLog.create({
        data: {
          flowId: flowIdForLog,
          payload: payloadStr,
          status: 'FAILED',
          details: `Global trigger execution failure: ${error.message}`,
        }
      });
    }

    return NextResponse.json({ error: 'Failed to execute trigger', details: error.message }, { status: 500 });
  }
}
