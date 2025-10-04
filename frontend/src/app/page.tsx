"use client";

import { useEffect, useMemo, useState } from 'react';
import { fetchTokens, AccessToken } from '../lib/api';
import { ExpiryFilter } from '../lib/filters';
import { FiltersBar } from '../components/FiltersBar';
import { TokenTable } from '../components/TokenTable';
import { RenewTokenModal } from '../components/RenewTokenModal';
import { Toast } from '../components/Toast';
import { SummaryCards } from '../components/SummaryCards';

export default function Home() {
  const [tokens, setTokens] = useState<AccessToken[]>([]);
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>('all');
  const [selectedToken, setSelectedToken] = useState<AccessToken | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTokens = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTokens();
        setTokens(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tokens');
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, []);

  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => {
      const matchesService = serviceFilter === 'all' || token.serviceName === serviceFilter;
      const matchesStatus = expiryFilter === 'all' || token.status === expiryFilter;
      return matchesService && matchesStatus;
    });
  }, [tokens, serviceFilter, expiryFilter]);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setToastMessage('Token copied to clipboard');
    });
  };

  const handleRenewClick = (token: AccessToken) => {
    setSelectedToken(token);
    setIsModalOpen(true);
  };

  const handleRenewSuccess = (updatedToken: AccessToken) => {
    setTokens((prev) => prev.map((token) => (token.id === updatedToken.id ? updatedToken : token)));
    setToastMessage('Token renewed successfully');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedToken(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-gray-900">Access Manager</h1>
          <p className="text-sm text-gray-500">
            Monitor and renew API access tokens across internal services.
          </p>
        </header>

        {isLoading && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600 shadow-sm">
            Loading tokens…
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            <SummaryCards tokens={tokens} />

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <FiltersBar
                tokens={tokens}
                serviceFilter={serviceFilter}
                expiryFilter={expiryFilter}
                onServiceChange={setServiceFilter}
                onExpiryChange={setExpiryFilter}
              />
            </div>

            <TokenTable
              tokens={filteredTokens}
              serviceFilter={serviceFilter}
              expiryFilter={expiryFilter}
              onCopy={handleCopy}
              onRenewClick={handleRenewClick}
            />
          </>
        )}
      </div>

      <RenewTokenModal
        token={selectedToken}
        open={isModalOpen}
        onClose={handleModalClose}
        onRenew={handleRenewSuccess}
      />

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
}
