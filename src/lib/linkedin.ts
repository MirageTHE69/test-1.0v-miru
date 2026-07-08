/**
 * Helper client to call LinkedIn API endpoints using standard Node fetch.
 */

export interface LinkedInProfile {
  id: string;
  name: string;
}

export interface LinkedInPost {
  id: string;
  content: string;
  createdAt: string;
  lifecycleState: string;
}

/**
 * Retrieves the LinkedIn profile details using OAuth token.
 * Tries the modern OIDC userinfo endpoint first, falls back to the /me endpoint.
 */
export async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  if (!accessToken) {
    throw new Error('Access token is required');
  }

  // 1. Try OIDC /userinfo endpoint (Next-gen LinkedIn API)
  try {
    const res = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.sub) {
        return {
          id: data.sub,
          name: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim(),
        };
      }
    }
  } catch (err) {
    console.warn('OIDC userinfo failed, falling back to /me profile endpoint:', err);
  }

  // 2. Fall back to legacy /me profile endpoint
  const res = await fetch('https://api.linkedin.com/v2/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LinkedIn Profile API returned ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const name = `${data.localizedFirstName || ''} ${data.localizedLastName || ''}`.trim();
  return {
    id: data.id,
    name: name || 'LinkedIn User',
  };
}

/**
 * Publishes a text post to LinkedIn using the UGC (User Generated Content) Posts API.
 */
export async function publishToLinkedIn(
  content: string,
  accessToken: string,
  personId?: string
): Promise<any> {
  let resolvedPersonId = personId;
  
  if (!resolvedPersonId) {
    const profile = await getLinkedInProfile(accessToken);
    resolvedPersonId = profile.id;
  }

  const url = 'https://api.linkedin.com/v2/ugcPosts';
  
  const payload = {
    author: `urn:li:person:${resolvedPersonId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content,
        },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LinkedIn Publish API returned ${response.status}: ${errorText}`);
  }

  return await response.json();
}

/**
 * Fetches the recent UGC posts authored by the user.
 */
export async function fetchLinkedInPosts(
  accessToken: string,
  personId?: string
): Promise<LinkedInPost[]> {
  let resolvedPersonId = personId;

  if (!resolvedPersonId) {
    const profile = await getLinkedInProfile(accessToken);
    resolvedPersonId = profile.id;
  }

  const authorUrn = encodeURIComponent(`urn:li:person:${resolvedPersonId}`);
  const url = `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(${authorUrn})&count=10`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LinkedIn Fetch API returned ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const elements = data.elements || [];

  return elements.map((el: any) => {
    const shareContent = el.specificContent?.['com.linkedin.ugc.ShareContent'];
    return {
      id: el.id,
      content: shareContent?.shareCommentary?.text || '',
      createdAt: el.created?.time ? new Date(el.created.time).toISOString() : new Date().toISOString(),
      lifecycleState: el.lifecycleState || 'PUBLISHED',
    };
  });
}
