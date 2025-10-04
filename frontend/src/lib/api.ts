const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4100';

export interface AccessToken {
  id: string;
  serviceName: string;
  token: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'expiring_soon';
}

export interface RenewTokenResponse {
  message: string;
  token: AccessToken;
  renewalToken: string;
}

export async function fetchTokens(): Promise<AccessToken[]> {
  const response = await fetch(`${API_BASE_URL}/api/tokens`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tokens');
  }

  const data = await response.json();
  return data.tokens as AccessToken[];
}

export async function renewToken(tokenId: string, authToken: string): Promise<RenewTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/tokens/${tokenId}/renew`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to renew token' }));
    throw new Error(error.error || 'Failed to renew token');
  }

  return (await response.json()) as RenewTokenResponse;
}

export function getFilterOptions(tokens: AccessToken[]) {
  const services = Array.from(new Set(tokens.map((token) => token.serviceName))).sort();
  return services;
}
