import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET as string | undefined;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const RENEWAL_DURATION_DAYS = Number(process.env.RENEWAL_DURATION_DAYS) || 90;
const RENEWAL_DURATION_MS = RENEWAL_DURATION_DAYS * DAY_IN_MS;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${port}`;

if (!Number.isFinite(port) || port <= 0) {
  throw new Error('PORT must be a positive number');
}

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

interface RenewTokenPayload {
  tokenId: string;
}

type TokenStatus = 'active' | 'expired' | 'expiring_soon';

interface AccessToken {
  id: string;
  serviceName: string;
  token: string;
  expiryDate: string;
  status: TokenStatus;
}

const mockTokens: AccessToken[] = [
  {
    id: 'token-1',
    serviceName: 'GitHub API',
    token: 'github-8f3f12a9d7',
    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'token-2',
    serviceName: 'AWS S3',
    token: 'aws-4c8b1e5f9a',
    expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'expired',
  },
  {
    id: 'token-3',
    serviceName: 'Stripe Payments',
    token: 'stripe-2a7d9153be',
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'expiring_soon',
  },
  {
    id: 'token-4',
    serviceName: 'SendGrid Email',
    token: 'sendgrid-5b9f63d4e1',
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'token-5',
    serviceName: 'Twilio SMS',
    token: 'twilio-1d3e8f7b2c',
    expiryDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'expired',
  },
  {
    id: 'token-6',
    serviceName: 'Google Maps',
    token: 'googlemaps-9f5e3d1a6c',
    expiryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'expiring_soon',
  },
  {
    id: 'token-7',
    serviceName: 'OpenAI API',
    token: 'openai-7a2b8c9d4e',
    expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'token-8',
    serviceName: 'Slack Integration',
    token: 'slack-3d6f8a1c5e',
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'expiring_soon',
  },
  {
    id: 'token-9',
    serviceName: 'Datadog Monitoring',
    token: 'datadog-6e9f3a1b8c',
    expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'expired',
  },
  {
    id: 'token-10',
    serviceName: 'Redis Cache',
    token: 'redis-4b7d1e3f9a',
    expiryDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
];

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Access Manager API',
      version: '1.0.0',
      description: 'API for managing access tokens across services.',
    },
    servers: [{ url: SERVER_URL }],
  },
  apis: [path.resolve(__dirname, '../openapi.yaml')],
});

function extractBearerToken(header?: string): string | null {
  if (!header) return null;
  const [scheme, value] = header.split(' ');
  if (scheme !== 'Bearer' || !value) return null;
  return value;
}

function issueRenewalToken(tokenId: string): string {
  return jwt.sign({ tokenId }, JWT_SECRET!, { expiresIn: `${RENEWAL_DURATION_DAYS}d` });
}

function findTokenById(id: string): AccessToken | undefined {
  return mockTokens.find((token) => token.id === id);
}

function renewTokenRecord(token: AccessToken): AccessToken {
  const renewed: AccessToken = {
    ...token,
    expiryDate: new Date(Date.now() + RENEWAL_DURATION_MS).toISOString(),
    status: 'active',
  };

  const tokenIndex = mockTokens.findIndex((item) => item.id === token.id);
  if (tokenIndex >= 0) {
    mockTokens[tokenIndex] = renewed;
  }

  return renewed;
}

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (_, res) => {
  res.json({ message: 'Access Manager backend is running' });
});

app.get('/api/tokens', (_, res) => {
  res.json({ tokens: mockTokens });
});

app.post('/api/tokens/:id/renew', (req, res) => {
  const { id } = req.params;
  const bearerToken = extractBearerToken(req.headers.authorization);

  if (!bearerToken) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }

  try {
    const decoded = jwt.verify(bearerToken, JWT_SECRET) as RenewTokenPayload;

    if (!decoded?.tokenId) {
      return res.status(400).json({ error: 'tokenId missing in JWT payload' });
    }

    if (decoded.tokenId !== id) {
      return res.status(403).json({ error: 'Token ID does not match authorization' });
    }

    const token = findTokenById(id);

    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const renewedToken = renewTokenRecord(token);
    const renewalToken = issueRenewalToken(renewedToken.id);

    res.json({
      message: 'Token renewed successfully',
      token: renewedToken,
      renewalToken,
    });
  } catch (error) {
    console.error('Failed to verify token', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running at ${SERVER_URL}`);
});
