import { NextResponse } from 'next/server';

// GET /api/test-webhook — fires a test payload to the Make.com webhook instantly
export async function GET() {
  const webhookUrl = 'https://hook.eu1.make.com/njet3pmk6xsa79n60cq6fo24n9wt24w3';

  const payload = {
    content: 'Test post from AgencyOS! Facebook automation is working! 🚀',
    clientId: 'test-client-001',
    source: 'AgencyOS',
    timestamp: new Date().toISOString(),
    channel: 'facebook',
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    return NextResponse.json({
      success: res.ok,
      httpStatus: res.status,
      makeResponse: text,
      payloadSent: payload,
      message: res.ok
        ? '✅ SUCCESS! Make.com received the payload. Go back to Make.com — you should now see the fields (content, channel, etc).'
        : `❌ FAILED. Make.com returned: ${text}. Make sure you clicked "Re-determine data structure" first!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
