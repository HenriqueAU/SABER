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

export enum TipoPerfil {
  GESTOR = 'gestor',
  BIBLIOTECARIO = 'bibliotecario',
  PROFESSOR = 'professor',
  ALUNO = 'aluno',
}

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date' })
  data_nasc!: Date;

  @Column({ nullable: true })
  foto_perfil?: string;

  @Column()
  nome!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  senha_hash!: string;

  @Column({ type: 'enum', enum: TipoPerfil })
  perfil!: TipoPerfil;

  @Column({ default: true })
  ativo!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @ManyToOne(() => Instituicao)
  @JoinColumn({ name: 'instituicao_id' })
  instituicao!: Instituicao;
}
