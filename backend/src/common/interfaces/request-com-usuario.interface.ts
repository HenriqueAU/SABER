import { TipoPerfil } from '../../modules/usuario/usuario.entity';

export interface RequestComUser extends Request {
  user: {
    id: string;
    instituicao: string;
    perfil: TipoPerfil;
    email: string;
  };
}
