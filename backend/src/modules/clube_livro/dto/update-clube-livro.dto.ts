import { PartialType } from '@nestjs/mapped-types';
import { CreateClubeLivroDto } from './creat-clube-livro.dto';

export class UpdateClubeLivroDto extends PartialType(CreateClubeLivroDto) {}
