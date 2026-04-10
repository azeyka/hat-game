import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "word_packs" })
export class WordPack {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "int", default: 1 })
  difficulty!: number;
}