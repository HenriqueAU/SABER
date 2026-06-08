import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MembroClube } from "./membro-clube.entity";
import { Repository } from "typeorm";
import { CreateMembroClubeDto } from "./dto/create-membro-clube.dto";
import { UpdateMembroClubeDto } from "./dto/update-membro-clube.dto";

@Injectable()
export class MembroClubeService {
    constructor(
        @InjectRepository(MembroClube)
        private readonly membroClubeRepository: Repository<MembroClube>,
    ) {}
    async create(createMembroClubeDto: CreateMembroClubeDto): Promise<MembroClube> {  
        const novoMembroClube = this.membroClubeRepository.create({
            usuario: { id: createMembroClubeDto.usuario_id },
            clube: { id: createMembroClubeDto.clube_id }, 
        });
        return await this.membroClubeRepository.save(novoMembroClube);
    }
    async findAll(): Promise<MembroClube[]> {
        return await this.membroClubeRepository.find({ relations: ['usuario', 'clube'] });
    }
    async findOne(id: string): Promise<MembroClube> {
       const membroClube = await this.membroClubeRepository.findOne({ where: { id }, relations: ['usuario', 'clube'] });
       if (!membroClube) {
        throw new Error('Membro do Clube não encontrado');
       }
       return membroClube;
    }
    async update(id: string, updateMembroClubeDto: UpdateMembroClubeDto): Promise<MembroClube> {
        const membroClubeExistente = await this.findOne(id);

        this.membroClubeRepository.merge(membroClubeExistente, updateMembroClubeDto);
        return await this.membroClubeRepository.save(membroClubeExistente);
    }
    async remove(id: string): Promise<void> {
        const membroClube = await this.findOne(id);
        await this.membroClubeRepository.remove(membroClube);
    }}