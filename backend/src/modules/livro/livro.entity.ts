import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Instituicao } from '../instituicao/instituicao.entity';

export enum FaixaEtaria {
  LIVRE = 'livre',
  DEZ_MAIS = '10+',
  DOZE_MAIS = '12+',
  QUATORZE_MAIS = '14+',
  DEZESSEIS_MAIS = '16+',
  DEZOITO_MAIS = '18+',
}

@Entity()
export class Livro {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  titulo!: string;

  @Column()
  autor!: string;

  @Column({ unique: true, nullable: true })
  isbn?: string;

  @Column({ nullable: true })
  editora?: string;

  @Column({ type: 'int', nullable: true })
  ano_publicacao?: number;

  @Column({ type: 'int', nullable: true })
  paginas?: number;

  @Column({ type: 'text', nullable: true })
  sinopse?: string;

  @Column({ nullable: true })
  capa_url?: string;

  @Column({
    type: 'enum',
    enum: FaixaEtaria,
    nullable: true,
  })
  faixa_etaria?: FaixaEtaria;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @ManyToOne(() => Instituicao)
  @JoinColumn({ name: 'instituicao_id' })
  instituicao!: Instituicao;
}
