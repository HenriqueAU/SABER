import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TipoInstituicao {
  ESCOLA = 'escola',
  FACULDADE = 'faculdade',
}

@Entity()
export class Instituicao {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nome!: string;

  @Column({
    type: 'enum',
    enum: TipoInstituicao,
  })
  tipo!: TipoInstituicao;

  @Column({ nullable: true, type: 'text' })
  cidade?: string | null;

  @Column({ nullable: true, type: 'text' })
  estado?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
