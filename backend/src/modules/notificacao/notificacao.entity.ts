import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';

@Entity('notificacao')
export class Notificacao {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  titulo!: string;

  @Column('text')
  mensagem!: string;

  @CreateDateColumn()
  data!: Date;

  @Column({ default: false })
  lida!: boolean;

  @Column({ name: 'usuario_id' })
  usuario_id!: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;
}