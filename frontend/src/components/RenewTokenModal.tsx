'use client';

import { useEffect, useState } from 'react';
import { AccessToken, renewToken } from '../lib/api';

interface RenewTokenModalProps {
  token: AccessToken | null;
  open: boolean;
  onClose: () => void;
  onRenew: (token: AccessToken) => void;
}

export function RenewTokenModal({ token, open, onClose, onRenew }: RenewTokenModalProps) {
  const [authToken, setAuthToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAuthToken('');
      setError(null);
      setSuccessMessage(null);
    }
  }, [open, token?.id]);

  if (!open || !token) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!authToken.trim()) {
      setError('Authorization token is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await renewToken(token.id, authToken.trim());
      onRenew(response.token);
      setSuccessMessage('Token renewed successfully. A new JWT has been issued.');
      setAuthToken(response.renewalToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to renew token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Renew Token</h2>
            <p className="mt-1 text-sm text-gray-500">
              Provide a valid JWT (Authorization header) to renew the selected token.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Token ID</p>
            <p className="text-sm text-gray-900">{token.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Service</p>
            <p className="text-sm text-gray-900">{token.serviceName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="authToken" className="text-sm font-medium text-gray-700">
              Authorization JWT
            </label>
            <textarea
              id="authToken"
              className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-sm font-mono text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={authToken}
              onChange={(event) => setAuthToken(event.target.value)}
              placeholder="Paste the Bearer token here"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {successMessage && (
            <div className="space-y-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              <p>{successMessage}</p>
              <div>
                <p className="font-medium">New JWT</p>
                <code className="mt-1 block w-full overflow-auto rounded bg-white/70 p-2 text-xs text-gray-800">
                  {authToken}
                </code>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Renewing...' : 'Renew Token'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
