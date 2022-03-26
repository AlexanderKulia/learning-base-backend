export interface AccessTokenPayload {
  sub: number;
  email: string;
  emailVerified: boolean;
}

export interface RefreshTokenPayload {
  sub: number;
  tokenVersion: number;
}
