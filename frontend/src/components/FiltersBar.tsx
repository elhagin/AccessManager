'use client';

import { AccessToken } from '../lib/api';
import { ExpiryFilter } from '../lib/filters';

interface FiltersBarProps {
  tokens: AccessToken[];
  serviceFilter: string;
  expiryFilter: ExpiryFilter;
  onServiceChange: (value: string) => void;
  onExpiryChange: (value: ExpiryFilter) => void;
}

export function FiltersBar({ tokens, serviceFilter, expiryFilter, onServiceChange, onExpiryChange }: FiltersBarProps) {
  const services = ['all', ...new Set(tokens.map((token) => token.serviceName))];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col text-sm font-medium text-gray-700">
          Service
          <select
            value={serviceFilter}
            onChange={(event) => onServiceChange(event.target.value)}
            className="mt-1 w-48 rounded-md border border-gray-400 bg-transparent px-3 py-2 text-sm font-medium text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400"
          >
            {services.map((service) => (
              <option key={service} value={service}>
                {service === 'all' ? 'All services' : service}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm font-medium text-gray-700">
          Status
          <select
            value={expiryFilter}
            onChange={(event) => onExpiryChange(event.target.value as ExpiryFilter)}
            className="mt-1 w-48 rounded-md border border-gray-400 bg-transparent px-3 py-2 text-sm font-medium text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="expiring_soon">Expiring soon</option>
            <option value="expired">Expired</option>
          </select>
        </label>
      </div>
    </div>
  );
}
