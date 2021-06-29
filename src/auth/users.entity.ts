import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Note } from "../notes/notes.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Note, (note) => note.user, { eager: true })
  notes: Note[];
}
