import { OfficerUser } from '../types';

const ALLOWED_PROTOCOLS = new Set(['https:', 'http:']);
const FALLBACK_SAFE_URL = 'https://github.com';

/**
 * Validates and sanitizes an external URL to prevent javascript:, data:, or vbscript: XSS injections.
 */
export function sanitizeExternalUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return FALLBACK_SAFE_URL;
  }
  const trimmed = rawUrl.trim().replace(/[\u0000-\u001F\u007F]/g, '');
  if (!trimmed) {
    return FALLBACK_SAFE_URL;
  }

  try {
    const parsed = new URL(trimmed);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return FALLBACK_SAFE_URL;
    }
    return parsed.toString();
  } catch {
    // Allow shorthand github.com/... by prefixing https://
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
      try {
        const parsed = new URL(`https://${trimmed}`);
        if (ALLOWED_PROTOCOLS.has(parsed.protocol)) {
          return parsed.toString();
        }
      } catch {
        return FALLBACK_SAFE_URL;
      }
    }
    return FALLBACK_SAFE_URL;
  }
}

/**
 * Strips HTML tags and control characters and enforces a strict maximum character length.
 */
export function sanitizeTextInput(raw: string, maxLength = 200): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // Strip control chars
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates an email address format safely without catastrophic backtracking.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string' || email.length > 120) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/**
 * Runtime schema validator for OfficerUser loaded from localStorage to prevent
 * prototype pollution, malformed JSON crashes, or privilege escalation.
 */
export function validateOfficerSession(raw: unknown): OfficerUser | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  if (
    typeof candidate.name !== 'string' ||
    typeof candidate.rank !== 'string' ||
    typeof candidate.callsign !== 'string' ||
    typeof candidate.email !== 'string' ||
    typeof candidate.clearanceLevel !== 'number'
  ) {
    return null;
  }

  const name = sanitizeTextInput(candidate.name, 60);
  const rank = sanitizeTextInput(candidate.rank, 60);
  const callsign = sanitizeTextInput(candidate.callsign, 30);
  const email = sanitizeTextInput(candidate.email, 120);
  const clearanceLevel = Math.min(5, Math.max(1, Math.floor(candidate.clearanceLevel)));

  if (!name || !rank || !callsign || !isValidEmail(email)) {
    return null;
  }

  return {
    name,
    rank,
    callsign,
    clearanceLevel,
    email,
  };
}

/**
 * Client-side passcode verification & rate limiter for Officer Accreditation.
 */
const MAX_AUTH_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30_000;
let failedAttempts = 0;
let lockoutUntil = 0;

export function checkAuthRateLimit(): { allowed: boolean; remainingSeconds: number } {
  const now = Date.now();
  if (lockoutUntil > now) {
    return {
      allowed: false,
      remainingSeconds: Math.ceil((lockoutUntil - now) / 1000),
    };
  }
  return { allowed: true, remainingSeconds: 0 };
}

export function verifyOfficerCredentials(email: string, passcode: string): {
  valid: boolean;
  error?: string;
} {
  const rateCheck = checkAuthRateLimit();
  if (!rateCheck.allowed) {
    return {
      valid: false,
      error: `Trop de tentatives. Réessayez dans ${rateCheck.remainingSeconds}s.`,
    };
  }

  const cleanEmail = sanitizeTextInput(email, 120);
  const cleanCode = passcode.trim();

  if (!isValidEmail(cleanEmail)) {
    return { valid: false, error: 'Format d’identifiant email invalide.' };
  }

  // Accepted accreditation passcodes for the portfolio officer console
  const validCodes = new Set(['ODYSSEY-2026', 'VEGA-12', 'SOLAR-ADMIN']);
  if (!validCodes.has(cleanCode.toUpperCase())) {
    failedAttempts += 1;
    if (failedAttempts >= MAX_AUTH_ATTEMPTS) {
      lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      failedAttempts = 0;
      return {
        valid: false,
        error: 'Seuil de sécurité atteint. Console verrouillée pendant 30 secondes.',
      };
    }
    return {
      valid: false,
      error: `Code d’habilitation invalide (${MAX_AUTH_ATTEMPTS - failedAttempts} essais restants). Utilisez le bouton d'accès démo ou ODYSSEY-2026.`,
    };
  }

  failedAttempts = 0;
  lockoutUntil = 0;
  return { valid: true };
}
