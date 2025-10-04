'use client';

import { useMemo } from 'react';
import { AccessToken } from '../lib/api';
import { ExpiryFilter, filterTokens, formatExpiry, getStatusClass, getStatusLabel, sortTokens } from '../lib/filters';

interface TokenTableProps {
  tokens: AccessToken[];
  serviceFilter: string;
  expiryFilter: ExpiryFilter;
  onCopy: (value: string) => void;
  onRenewClick: (token: AccessToken) => void;
}

export function TokenTable({ tokens, serviceFilter, expiryFilter, onCopy, onRenewClick }: TokenTableProps) {
  const filteredTokens = useMemo(() => {
    const filtered = filterTokens(tokens, serviceFilter, expiryFilter);
    return sortTokens(filtered);
  }, [tokens, serviceFilter, expiryFilter]);

  if (!filteredTokens.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-sm text-gray-500">
        No tokens match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Token</th>
            <th className="px-4 py-3">Expiry</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredTokens.map((token) => (
            <tr key={token.id} className="text-sm text-gray-700 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{token.serviceName}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <code className="max-w-[220px] truncate rounded bg-gray-100 px-2 py-1 text-xs">{token.token}</code>
                  <button
                    type="button"
                    onClick={() => onCopy(token.token)}
                    className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
                  >
                    Copy
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{formatExpiry(token.expiryDate)}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(token.status)}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                  {getStatusLabel(token.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onRenewClick(token)}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Renew
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
