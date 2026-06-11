export interface RequestComUser extends Request {
  user: {
    id: string;
    instituicao: string;
    perfil: string;
    email: string;
  };
}
