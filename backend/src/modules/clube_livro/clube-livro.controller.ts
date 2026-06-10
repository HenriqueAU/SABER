import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClubeService } from './clube-livro.service';
import { UpdateClubeLivroDto } from './dto/update-clube-livro.dto';
import { CreateClubeLivroDto } from './dto/create-clube-livro.dto';

@Controller('clubes')
export class ClubeController {
  constructor(private readonly clubeService: ClubeService) {}

  @Post()
  create(@Body() createClubeDto: CreateClubeLivroDto) {
    return this.clubeService.create(createClubeDto);
  }

  @Get()
  findAll() {
    return this.clubeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() UpdateClubeLivroDto: UpdateClubeLivroDto,
  ) {
    return this.clubeService.update(id, UpdateClubeLivroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clubeService.remove(id);
  }
}
