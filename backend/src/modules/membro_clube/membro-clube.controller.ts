import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MembroClubeService } from './membro-clube.service';
import { CreateMembroClubeDto } from './dto/create-membro-clube.dto';
import { UpdateMembroClubeDto } from './dto/update-membro-clube.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Membro do clube')
@ApiBearerAuth()
@Controller('membro-clube')
export class MembroClubeController {
  constructor(private readonly membroClubeService: MembroClubeService) {}

  @ApiOperation({ summary: 'Criação do membro do clube' })
  @ApiResponse({ status: 201, description: 'Membro criado com sucesso' })
  @Post()
  create(@Body() createMembroClubeDto: CreateMembroClubeDto) {
    return this.membroClubeService.create(createMembroClubeDto);
  }

  @ApiOperation({ summary: 'Lista todos os membros do clube' })
  @ApiResponse({
    status: 200,
    description: 'Lista de membros retornada com sucesso',
  })
  @Get()
  findAll() {
    return this.membroClubeService.findAll();
  }

  @ApiOperation({ summary: 'Busca um membro pelo id' })
  @ApiResponse({ status: 200, description: 'Busca realizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Membro não encontrado' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membroClubeService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza um membro existente' })
  @ApiResponse({
    status: 200,
    description: 'Atualização realizada com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Membro não encontrado' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMembroClubeDto: UpdateMembroClubeDto,
  ) {
    return this.membroClubeService.update(id, updateMembroClubeDto);
  }

  @ApiOperation({ summary: 'Remove um membro' })
  @ApiResponse({ status: 200, description: 'Membro removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Membro não encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membroClubeService.remove(id);
  }
}
