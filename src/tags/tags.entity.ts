import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from "class-transformer";
import { User } from "src/auth/users.entity";

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @ManyToOne(() => User, (user) => user.notes, { eager: false })
  @Exclude({ toPlainOnly: true })
  user: User;
}
