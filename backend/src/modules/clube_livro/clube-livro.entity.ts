import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Livro } from '../livro/livro.entity';

@Entity()
export class ClubeLivro {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'professor_id' })
  professor!: Usuario;

  @ManyToOne(() => Livro)
  @JoinColumn({ name: 'livro_id' })
  livro!: Livro;

  @Column()
  nome!: string;

  @Column({ default: true })
  ativo!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  data_inicio?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  data_fim?: Date | null;

  @Column({ nullable: true, type: 'text' })
  local_encontro?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
