import { EntityRepository, Repository } from "typeorm";
import { User } from "./users.entity";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import {
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ message: string }> {
    const { email, password } = authCredentialsDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.create({ email, password: hashedPassword });

    try {
      await this.save(user);
      return { message: "User created successfully" };
    } catch (error) {
      // duplicate email
      if (error.code === "23505") {
        throw new ConflictException("Email already exists");
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
