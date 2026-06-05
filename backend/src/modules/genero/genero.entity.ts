import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Genero {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  nome!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}