import crypto from 'crypto';

interface XCredentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

/**
 * Generates OAuth 1.0a Header for POST request to X (Twitter) api.twitter.com/2/tweets
 */
export function getTwitterAuthHeader(
  method: string,
  url: string,
  creds: XCredentials
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: creds.consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: creds.accessToken,
    oauth_version: '1.0',
  };

  // Sort parameters alphabetically
  const sortedKeys = Object.keys(oauthParams).sort();
  const parameterString = sortedKeys
    .map(key => `${percentEncode(key)}=${percentEncode(oauthParams[key])}`)
    .join('&');

  // Create signature base string
  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(parameterString)
  ].join('&');

  // Create signing key
  const signingKey = [
    percentEncode(creds.consumerSecret),
    percentEncode(creds.accessTokenSecret)
  ].join('&');

  // Generate signature
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  // Build Authorization header
  const headerParams = {
    ...oauthParams,
    oauth_signature: signature
  };

  const authHeader = 'OAuth ' + Object.keys(headerParams)
    .sort()
    .map(key => `${percentEncode(key)}="${percentEncode(headerParams[key as keyof typeof headerParams])}"`)
    .join(', ');

  return authHeader;
}

/**
 * Publishes a tweet to X using OAuth 1.0a User Context (Free Tier)
 */
export async function publishToX(content: string, creds: XCredentials) {
  const url = 'https://api.twitter.com/2/tweets';
  const authHeader = getTwitterAuthHeader('POST', url, creds);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: content })
  });

  const responseData = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorText = responseData.detail || responseData.title || `Status ${response.status}`;
    throw new Error(`X API rejected the tweet: ${errorText}`);
  }

  return responseData;
}
