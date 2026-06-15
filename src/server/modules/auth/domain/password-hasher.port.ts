export interface PasswordHasherPort {
  hash(plainText: string): Promise<string>;
  verify(plainText: string, digest: string): Promise<boolean>;
}
