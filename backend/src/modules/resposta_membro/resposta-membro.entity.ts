import { Entity, 
PrimaryGeneratedColumn, 
ManyToOne, 
JoinColumn, 
CreateDateColumn 
} from "typeorm";
import { MembroClube } from "../membro_clube/membro-clube.entity";
import { ItemPergunta } from "../item_pergunta/item-pergunta.entity";

@Entity()
export class RespostaMembro {
    @PrimaryGeneratedColumn('uuid')
    id!: string;    

    @ManyToOne(() => MembroClube)
    @JoinColumn({name: 'membro_id'})
    membro!: MembroClube;

    @ManyToOne(() => ItemPergunta)
    @JoinColumn({name: 'item_pergunta_id'})
    itemPergunta!: ItemPergunta;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

}