import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "words" })
export class Word {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  text!: string;

  @Index()
  @Column({ type: "uuid" })
  pack_id!: string;
}
