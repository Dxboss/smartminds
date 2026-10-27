import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 64 * 1024 * 1024,
  });
  return ["scrypt", SCRYPT_N, SCRYPT_R, SCRYPT_P, salt.toString("hex"), derived.toString("hex")].join("$");
}

/** Supports legacy plaintext records once, so a successful login can upgrade them. */
export function verifyPassword(password: string, stored: string): { valid: boolean; needsRehash: boolean } {
  if (!stored.startsWith("scrypt$")) {
    const supplied = Buffer.from(password);
    const legacy = Buffer.from(stored);
    return {
      valid: supplied.length === legacy.length && timingSafeEqual(supplied, legacy),
      needsRehash: true,
    };
  }

  const [algorithm, n, r, p, saltHex, hashHex] = stored.split("$");
  if (
    algorithm !== "scrypt" ||
    Number(n) !== SCRYPT_N ||
    Number(r) !== SCRYPT_R ||
    Number(p) !== SCRYPT_P ||
    !/^[a-f0-9]{32}$/i.test(saltHex || "") ||
    !/^[a-f0-9]{128}$/i.test(hashHex || "")
  ) {
    return { valid: false, needsRehash: false };
  }

  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 64 * 1024 * 1024,
  });
  return { valid: timingSafeEqual(actual, expected), needsRehash: false };
}
