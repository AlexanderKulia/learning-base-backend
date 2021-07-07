export interface JwtAccessPayload {
  sub: number;
  email: string;
}

export interface JwtRefreshPayload {
  sub: number;
  tokenVersion: number;
}
