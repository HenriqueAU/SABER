import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Livro } from '../livro/livro.entity';
import { Genero } from '../genero/genero.entity';

@Entity()
export class LivroGenero {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Livro)
  @JoinColumn({ name: 'livro_id' })
  livro!: Livro;

  @ManyToOne(() => Genero)
  @JoinColumn({ name: 'genero_id' })
  genero!: Genero;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
