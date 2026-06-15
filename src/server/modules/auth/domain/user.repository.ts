import type { User, UserRole } from "./user.entity";

export type CreateUserInput = {
  phoneNumber?: string;
  username?: string;
  email?: string;
  role: UserRole;
  passwordHash: string;
  isActive?: boolean;
};

export interface UserRepository {
  create(input: CreateUserInput): Promise<User>;
  list(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  updateIsActive(id: string, isActive: boolean): Promise<void>;
  updateRole(id: string, role: UserRole): Promise<void>;
}
