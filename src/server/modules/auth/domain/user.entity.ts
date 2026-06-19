export type UserRole = "PATIENT" | "STAFF" | "ADMIN" | "DOCTOR" | "SUPER_ADMIN";

export type User = {
  id: string;
  phoneNumber?: string;
  username?: string;
  email?: string;
  role: UserRole;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
};

export type PublicUser = Omit<User, "passwordHash">;

export const toPublicUser = (user: User): PublicUser => {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
};
