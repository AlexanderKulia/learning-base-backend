import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Note } from "../notes/notes.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 0 })
  tokenVersion: number;

  @OneToMany(() => Note, (note) => note.user, { eager: true })
  notes: Note[];
}
