export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: "CLIENT" | "FREELANCER";
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
  role: "ADMIN" | "CLIENT" | "FREELANCER";
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
  role: "ADMIN" | "CLIENT" | "FREELANCER";
  tenantId: string;
  walletAddress?: string;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  user: UserPayload | null;
}
