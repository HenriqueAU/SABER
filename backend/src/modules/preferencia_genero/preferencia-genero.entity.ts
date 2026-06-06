import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Usuario } from '../usuario/usuario.entity';
import { Genero } from '../genero/genero.entity';

@Entity()
export class PreferenciaGenero {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @ManyToOne(() => Genero)
  @JoinColumn({ name: 'genero_id' })
  genero!: Genero;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
