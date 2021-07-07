export interface AccessTokenPayload {
  sub: number;
  email: string;
}

export interface RefreshTokenPayload {
  sub: number;
  tokenVersion: number;
}
