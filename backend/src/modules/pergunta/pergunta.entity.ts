import{
Entity,
CreateDateColumn,
PrimaryGeneratedColumn,
Column,
} from 'typeorm';


@Entity()
export class Pergunta{
    @PrimaryGeneratedColumn('uuid')
    id!: string;
    
    @Column()
    texto!: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;
}