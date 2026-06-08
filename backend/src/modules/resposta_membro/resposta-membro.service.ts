import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; 
import { RespostaMembro } from './resposta-membro.entity';
import { CreateRespostaMembroDto } from './dto/create-resposta-membro.dto';


@Injectable()
export class RespostaMembroService {
  constructor(
    @InjectRepository(RespostaMembro)
    private readonly respostaMembroRepository: Repository<RespostaMembro>,
  ) {}
    
  async create(createRespostaMembroDto: CreateRespostaMembroDto): Promise<RespostaMembro> {
   
    const novaRespostaMembro = this.respostaMembroRepository.create({
      ...createRespostaMembroDto,
      membro: { id: createRespostaMembroDto.membro_id },
      itemPergunta: { id: createRespostaMembroDto.item_pergunta_id },
    });
    
    return await this.respostaMembroRepository.save(novaRespostaMembro);
  }

  async findAll(): Promise<RespostaMembro[]> {
    return await this.respostaMembroRepository.find({ relations: ['membro', 'itemPergunta'] });
  }
  async findOne(id: string): Promise<RespostaMembro> {
    const respostaMembro = await this.respostaMembroRepository.findOne({
      where: { id }, 
      relations: ['membro', 'itemPergunta']
    });
    if (!respostaMembro) {
      throw new NotFoundException('Resposta do Membro não encontrada');
    }
    return respostaMembro;
  }
  async remove(id: string): Promise<void> {
    const respostaMembro = await this.findOne(id);
    await this.respostaMembroRepository.remove(respostaMembro);
  }
}