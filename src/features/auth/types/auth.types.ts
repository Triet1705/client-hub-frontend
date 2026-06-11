export interface LoginRequest {
  email: string;
  password: string;
}

export type Role = "ADMIN" | "CLIENT" | "FREELANCER";

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
  email: string;
  full_name: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface JwtResponse {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number; // seconds
  id: string;
  email: string;
  role: Role;
  tenant_id: string;
}

export interface ErrorResponse {
  title: string;
  message: string;
  status: number;
}

export interface UserPayload {
  id: string;
  email: string;
  role: Role;
  tenantId: string;
  walletAddress?: string;
  fullName?: string;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  user: UserPayload | null;
}
