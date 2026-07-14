import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Livro } from '../livro/livro.entity';

export enum StatusExemplar {
  DISPONIVEL = 'disponivel',
  EMPRESTADO = 'emprestado',
  DANIFICADO = 'danificado',
  PERDIDO = 'perdido',
}

@Entity()
export class Exemplar {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  codigo!: string;

  @Column({
    type: 'enum',
    enum: StatusExemplar,
    default: StatusExemplar.DISPONIVEL,
  })
  status!: StatusExemplar;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @ManyToOne(() => Livro)
  @JoinColumn({ name: 'livro_id' })
  livro!: Livro;

  @Column({ default: true })
  ativo!: boolean;
}
