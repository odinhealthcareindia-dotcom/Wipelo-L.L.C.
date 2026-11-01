import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";

// Values are bound to their purpose through AES-GCM additional data, so one cookie can't be replayed as another.
export type SealPurpose = "session" | "id-token" | "oauth";

export type Sealer = { seal(value: string, purpose: SealPurpose): string; unseal(sealed: string, purpose: SealPurpose): string | null };

function parseKey(encoded: string) {
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("Encryption keys must be 32 bytes, base64 encoded.");
  return key;
}

// The previous key only decrypts, which lets the key rotate without signing everyone out.
export function createSealer(currentKey: string, previousKey?: string): Sealer {
  const current = parseKey(currentKey);
  const keys = previousKey ? [current, parseKey(previousKey)] : [current];
  return {
    seal(value, purpose) {
      const iv = randomBytes(12);
      const cipher = createCipheriv("aes-256-gcm", current, iv);
      cipher.setAAD(Buffer.from(purpose));
      const body = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
      return ["v1", iv.toString("base64url"), body.toString("base64url"), cipher.getAuthTag().toString("base64url")].join(".");
    },
    unseal(sealed, purpose) {
      const [version, iv, body, tag] = sealed.split(".");
      if (version !== "v1" || !iv || !body || !tag) return null;
      for (const key of keys) {
        try {
          const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
          decipher.setAAD(Buffer.from(purpose));
          decipher.setAuthTag(Buffer.from(tag, "base64url"));
          return Buffer.concat([decipher.update(Buffer.from(body, "base64url")), decipher.final()]).toString("utf8");
        } catch {
          continue;
        }
      }
      return null;
    },
  };
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256Base64Url(value: string) {
  return createHash("sha256").update(value).digest("base64url");
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
