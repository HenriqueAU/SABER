import { PartialType } from '@nestjs/mapped-types';
import { CreateClubeLivroDto } from './create-clube-livro.dto';

export class UpdateClubeLivroDto extends PartialType(CreateClubeLivroDto) {}
