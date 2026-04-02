import { env } from '$env/dynamic/private';

const DEFAULT_DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:4173',
  'http://localhost:4174',
  'http://localhost:4175',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:4174',
  'http://127.0.0.1:4175',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

function toOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function getTrustedOrigins(): string[] {
  const configured = [
    env.BETTER_AUTH_URL,
    env.PUBLIC_APP_URL,
    ...(env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',') ?? []),
    ...(env.TRUSTED_ORIGINS?.split(',') ?? []),
  ]
    .map((origin) => origin?.trim())
    .filter(Boolean) as string[];

  const origins = [...DEFAULT_DEV_ORIGINS, ...configured]
    .map(toOrigin)
    .filter(Boolean) as string[];

  return [...new Set(origins)];
}

export function isTrustedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  const normalizedOrigin = toOrigin(origin);
  if (!normalizedOrigin) return false;

  if (getTrustedOrigins().includes(normalizedOrigin)) {
    return true;
  }

  if (env.NODE_ENV !== 'production') {
    try {
      const { hostname, protocol } = new URL(normalizedOrigin);
      if (protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}
