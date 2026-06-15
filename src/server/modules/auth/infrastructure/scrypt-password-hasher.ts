import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { PasswordHasherPort } from "../domain/password-hasher.port";

const scrypt = promisify(scryptCallback);

export class ScryptPasswordHasher implements PasswordHasherPort {
  async hash(plainText: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const derived = (await scrypt(plainText, salt, 64)) as Buffer;
    return `${salt}:${derived.toString("hex")}`;
  }

  async verify(plainText: string, digest: string): Promise<boolean> {
    const [salt, storedHash] = digest.split(":");

    if (!salt || !storedHash) {
      return false;
    }

    const derived = (await scrypt(plainText, salt, 64)) as Buffer;
    const stored = Buffer.from(storedHash, "hex");

    if (stored.length !== derived.length) {
      return false;
    }

    return timingSafeEqual(stored, derived);
  }
}
