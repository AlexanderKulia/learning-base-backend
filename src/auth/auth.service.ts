import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma.service";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import { AccessTokenPayload, RefreshTokenPayload } from "./jwt.interface";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ message: string }> {
    const { email, password } = authCredentialsDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      await this.prisma.user.create({
        data: { email, password: hashedPassword },
      });
      return { message: "User created successfully" };
    } catch (error) {
      // duplicate email
      if (error.code === "P2002") {
        throw new ConflictException("Email already exists");
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = authCredentialsDto;
    const user = await this.prisma.user.findUnique({ where: { email } });

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

    const user = await this.prisma.user.findUnique({
      where: { id: refreshPayload.sub },
    });
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
    const payload: AccessTokenPayload = { sub: id, email };
    return this.jwtService.sign(payload);
  }

  createNewRefreshToken(user: User): string {
    const { id } = user;
    const payload: RefreshTokenPayload = {
      sub: id,
      tokenVersion: user.tokenVersion,
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_REFRESH_SECRET"),
    });
  }

  verifyRefreshToken(refreshToken: string): RefreshTokenPayload {
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
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        tokenVersion: { increment: 1 },
      },
    });
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
