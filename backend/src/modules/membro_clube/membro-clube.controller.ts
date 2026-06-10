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

@Controller('membro-clube')
export class MembroClubeController {
  constructor(private readonly membroClubeService: MembroClubeService) {}

  @Post()
  create(@Body() createMembroClubeDto: CreateMembroClubeDto) {
    return this.membroClubeService.create(createMembroClubeDto);
  }

  @Get()
  findAll() {
    return this.membroClubeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membroClubeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMembroClubeDto: UpdateMembroClubeDto,
  ) {
    return this.membroClubeService.update(id, updateMembroClubeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membroClubeService.remove(id);
  }
}
