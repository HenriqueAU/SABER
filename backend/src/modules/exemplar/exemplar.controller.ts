import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req
} from '@nestjs/common';
import { ExemplarService } from './exemplar.service';
import { CreateExemplarDto } from './dto/create-exemplar.dto';
import { UpdateExemplarDto } from './dto/update-exemplar.dto';

@Controller('exemplares')
export class ExemplarController {
  constructor(private readonly exemplarService: ExemplarService) {}

  @Post()
  create(@Body() createExemplarDto: CreateExemplarDto) {
    return this.exemplarService.create(createExemplarDto);
  }

  @Get()
  findAll(@Req() request: any) {
    const instituicao_id = request.user.instituicao;
    return this.exemplarService.findAll(instituicao_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exemplarService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExemplarDto: UpdateExemplarDto,
  ) {
    return this.exemplarService.update(id, updateExemplarDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exemplarService.remove(id);
  }
}
