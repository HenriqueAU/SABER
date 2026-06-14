export interface JwtPayload {
  iat?: number;
  exp?: number;
  instituicao: string;
  id: string;
  perfil: string;
  email: string;
}
