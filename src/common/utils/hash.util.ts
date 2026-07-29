import * as argon2 from 'argon2';

/**
 * Argon2 wrapper shared by password hashing, refresh-token hashing and
 * password-reset-token hashing — the service is never allowed to persist
 * a secret in plaintext.
 */
export async function hashSecret(value: string): Promise<string> {
  return argon2.hash(value);
}

export async function verifySecret(hash: string, value: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, value);
  } catch {
    return false;
  }
}
