import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pergunta } from '../pergunta/pergunta.entity';

@Entity()
export class ItemPergunta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Pergunta)
  @JoinColumn({ name: 'pergunta_id' })
  pergunta!: Pergunta;

  @Column()
  texto!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
