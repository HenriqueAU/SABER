import { Column,
CreateDateColumn, 
Entity, 
JoinColumn, 
ManyToOne, 
PrimaryGeneratedColumn, 
UpdateDateColumn 
} from "typeorm";
import { ClubeLivro } from "../clube_livro/clube-livro.entity";
import { Usuario } from "../usuario/usuario.entity";

export enum StatusMembro {
    PENDENTE = 'pendente',
    CONFIRMADO = 'confirmado',
    CANCELADO = 'cancelado',
    FINALIZADO = 'finalizado',
}

@Entity()
export class MembroClube {
    @PrimaryGeneratedColumn('uuid')
    id!: string;    

    @ManyToOne(() => ClubeLivro)
    @JoinColumn({name: 'clube_id'})
    clube!: ClubeLivro;

    @ManyToOne(() => Usuario)
    @JoinColumn({name: 'usuario_id'})
    usuario!: Usuario;

    @Column({type: 'enum', enum: StatusMembro})
    status!: StatusMembro;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date;
}