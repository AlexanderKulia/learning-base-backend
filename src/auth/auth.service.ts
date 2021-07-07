import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersRepository } from "./users.repository";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { JwtAccessPayload, JwtRefreshPayload } from "./jwt.interface";
import { User } from "./users.entity";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository) private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  signUp(authCredentialsDto: AuthCredentialsDto): Promise<{ message: string }> {
    return this.usersRepository.createUser(authCredentialsDto);
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = authCredentialsDto;
    const user = await this.usersRepository.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = this.createNewAccessToken(user);
      const refreshToken = this.createNewRefreshToken(user);
      return { accessToken, refreshToken };
    } else {
      throw new UnauthorizedException("Please check your login credentials");
    }
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException("Invalid refreshToken");
    }

    const refreshPayload = this.verifyRefreshToken(refreshToken);

    const user = await this.usersRepository.findOne(refreshPayload.sub);
    if (!user) {
      throw new InternalServerErrorException();
    }

    if (user.tokenVersion !== refreshPayload.tokenVersion) {
      throw new UnauthorizedException("Invalid refreshToken");
    }

    const newAccessToken = this.createNewAccessToken(user);
    const newRefreshToken = this.createNewRefreshToken(user);
    return { newAccessToken, newRefreshToken };
  }

  createNewAccessToken(user: User): string {
    const { id, email } = user;
    const payload: JwtAccessPayload = { sub: id, email };
    return this.jwtService.sign(payload);
  }

  createNewRefreshToken(user: User): string {
    const { id } = user;
    const payload: JwtRefreshPayload = {
      sub: id,
      tokenVersion: user.tokenVersion,
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_REFRESH_SECRET"),
    });
  }

  verifyRefreshToken(refreshToken: string): JwtRefreshPayload {
    let payload = null;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
      });
    } catch (error) {
      throw new UnauthorizedException("Token is malformed");
    }
    return payload;
  }

  async revokeRefreshTokensForUser(userId: number): Promise<boolean> {
    await this.usersRepository.increment({ id: userId }, "tokenVersion", 1);
    return true;
  }

  verifyCurrentUser(refreshToken: string): boolean {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
