import { JwtPayload } from 'jsonwebtoken';

export type Roles = 'admin' | 'user';

export interface UserRole {
  id: number;
  name: Roles;
}
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  roles: UserRole[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
export interface RegisterResponse {
  success: boolean;
  message?: string;
  user: User;
  tokens: AuthTokens;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
export type LoginApiResponse = ApiResponse<LoginResponse>;

export interface TokenPayload extends JwtPayload {
  id: string;
  roles: string[];
}

export interface RefreshTokens {
  accessToken: string;
  refreshToken: string;
}
