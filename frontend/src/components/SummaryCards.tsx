'use client';

import { useMemo } from 'react';
import { AccessToken } from '../lib/api';

interface SummaryCardsProps {
  tokens: AccessToken[];
}

function countByStatus(tokens: AccessToken[]) {
  return tokens.reduce(
    (acc, token) => {
      acc.total += 1;
      acc[token.status] += 1;
      return acc;
    },
    { total: 0, active: 0, expired: 0, expiring_soon: 0 }
  );
}

const CARDS = [
  {
    key: 'total',
    label: 'Total Tokens',
    description: 'Total number of managed tokens',
    className: 'border-gray-200 bg-white',
  },
  {
    key: 'active',
    label: 'Active Tokens',
    description: 'Tokens with valid expiry dates',
    className: 'border-green-200 bg-green-50 text-green-800',
  },
  {
    key: 'expiring_soon',
    label: 'Expiring Soon',
    description: 'Tokens expiring within 7 days',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  {
    key: 'expired',
    label: 'Expired Tokens',
    description: 'Tokens that require immediate action',
    className: 'border-red-200 bg-red-50 text-red-800',
  },
] as const;

export function SummaryCards({ tokens }: SummaryCardsProps) {
  const counts = useMemo(() => countByStatus(tokens), [tokens]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className={`rounded-lg border p-4 shadow-sm ${card.className}`}
        >
          <p className="text-sm font-medium text-gray-500">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{counts[card.key]}</p>
          <p className="mt-1 text-xs text-gray-500">{card.description}</p>
        </div>
      ))}
    </div>
  );
}
