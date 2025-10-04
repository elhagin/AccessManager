import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { findTokenById, getTokens, updateToken } from '../db';

interface RenewTokenPayload {
  tokenId: string;
}

interface CreateTokenRouterOptions {
  jwtSecret: string;
  renewalDurationDays: number;
  renewalDurationMs: number;
}

function extractBearerToken(header?: string): string | null {
  if (!header) return null;
  const [scheme, value] = header.split(' ');
  if (scheme !== 'Bearer' || !value) return null;
  return value;
}

function issueRenewalToken(tokenId: string, jwtSecret: string, renewalDurationDays: number): string {
  return jwt.sign({ tokenId }, jwtSecret, { expiresIn: `${renewalDurationDays}d` });
}

export function createTokenRouter({ jwtSecret, renewalDurationDays, renewalDurationMs }: CreateTokenRouterOptions) {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required to create token routes');
  }

  const router = Router();

  router.get('/', async (_req, res) => {
    try {
      const tokens = await getTokens();
      res.json({ tokens });
    } catch (error) {
      console.error('Failed to fetch tokens', error);
      res.status(500).json({ error: 'Failed to fetch tokens' });
    }
  });

  router.post('/:id/renew', async (req, res) => {
    const { id } = req.params;
    const bearerToken = extractBearerToken(req.headers.authorization);

    if (!bearerToken) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    try {
      const decoded = jwt.verify(bearerToken, jwtSecret) as RenewTokenPayload;

      if (!decoded?.tokenId) {
        return res.status(400).json({ error: 'tokenId missing in JWT payload' });
      }

      if (decoded.tokenId !== id) {
        return res.status(403).json({ error: 'Token ID does not match authorization' });
      }

      const token = await findTokenById(id);

      if (!token) {
        return res.status(404).json({ error: 'Token not found' });
      }

      const newExpiry = new Date(Date.now() + renewalDurationMs);
      await updateToken(id, newExpiry, 'active');

      const refreshedToken = await findTokenById(id);
      const renewalToken = issueRenewalToken(id, jwtSecret, renewalDurationDays);

      res.json({
        message: 'Token renewed successfully',
        token: refreshedToken,
        renewalToken,
      });
    } catch (error) {
      console.error('Failed to renew token', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  });

  return router;
}
