export type PasswordResetRequest = {
  id: string;
  userId: string;
  otpCodeHash: string;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
};
