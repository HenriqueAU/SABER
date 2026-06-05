import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Exemplar } from '../exemplar/exemplar.entity';
import { Usuario } from '../usuario/usuario.entity';

@Entity()
export class Emprestimo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Exemplar)
  @JoinColumn({ name: 'exemplar_id' })
  exemplar!: Exemplar;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ type: 'timestamptz' })
  data_retirada!: Date;

  @Column({ type: 'timestamptz' })
  data_devolucao_esperada!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  data_devolucao_efetiva?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
