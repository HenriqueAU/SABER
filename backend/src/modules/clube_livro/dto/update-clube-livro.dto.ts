import { PartialType } from '@nestjs/swagger';
import { CreateClubeLivroDto } from './create-clube-livro.dto';

export class UpdateClubeLivroDto extends PartialType(CreateClubeLivroDto) {}
