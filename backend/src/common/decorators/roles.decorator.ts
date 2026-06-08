import { SetMetadata } from '@nestjs/common';
import { TipoPerfil } from '../../modules/usuario/usuario.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: TipoPerfil[]) => SetMetadata(ROLES_KEY, roles);
