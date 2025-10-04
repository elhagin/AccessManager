import { AccessToken } from './api';

export type ExpiryFilter = 'all' | 'active' | 'expired' | 'expiring_soon';

export function filterTokens(
  tokens: AccessToken[],
  serviceFilter: string,
  expiryFilter: ExpiryFilter
): AccessToken[] {
  return tokens.filter((token) => {
    const matchesService = serviceFilter === 'all' || token.serviceName === serviceFilter;
    const matchesExpiry = expiryFilter === 'all' || token.status === expiryFilter;
    return matchesService && matchesExpiry;
  });
}

export function sortTokens(tokens: AccessToken[]): AccessToken[] {
  return [...tokens].sort((a, b) => {
    const dateA = new Date(a.expiryDate).getTime();
    const dateB = new Date(b.expiryDate).getTime();
    return dateA - dateB;
  });
}

export function formatExpiry(expiryDate: string): string {
  const date = new Date(expiryDate);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'expired':
      return 'Expired';
    case 'expiring_soon':
      return 'Expiring Soon';
    default:
      return status;
  }
}

export function getStatusClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'expired':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'expiring_soon':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
