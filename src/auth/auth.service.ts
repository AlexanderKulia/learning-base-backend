import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import crypto from "crypto";
import { EmailService } from "../email/email.service";
import { PrismaService } from "../prisma.service";
import { GenericResponse } from "../types";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { VerifyPasswordResetTokenDto } from "./dto/verify-password-reset-token.dto";
import { AccessTokenPayload, RefreshTokenPayload } from "./jwt.interface";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async signUp(authCredentialsDto: SignUpDto): Promise<GenericResponse> {
    const { email, password } = authCredentialsDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      await this.prisma.user.create({
        data: { email, password: hashedPassword, emailVerified: false },
      });
      const verificationUrl = await this.generateEmailVerificationUrl(email);
      await this.emailService.sendEmailVerification(email, verificationUrl);
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
    authCredentialsDto: SignInDto,
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
    const { id, email, emailVerified } = user;
    const payload: AccessTokenPayload = { sub: id, email, emailVerified };
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

  async sendPasswordReset(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<GenericResponse> {
    const { email } = forgotPasswordDto;
    const message = "Email has been sent to this email";

    try {
      const found = await this.prisma.user.findUnique({ where: { email } });
      if (!found) return { message };
      const url = await this.generatePasswordResetUrl(email);
      await this.emailService.sendPasswordReset(email, url);
      return { message };
    } catch (error) {
      this.logger.error(error);
    }
  }

  async generatePasswordResetUrl(email: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    const tokenFound = await this.prisma.token.findUnique({
      where: {
        type_userId: {
          userId: user.id,
          type: "RESET_PASSWORD",
        },
      },
    });
    if (tokenFound)
      await this.prisma.token.delete({
        where: {
          id: tokenFound.id,
        },
      });

    const token = crypto.randomBytes(32).toString("hex");
    const salt = await bcrypt.genSalt();
    const hashedToken = await bcrypt.hash(token, salt);
    await this.prisma.token.create({
      data: {
        token: hashedToken,
        type: "RESET_PASSWORD",
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
    const baseUrl = this.configService.get("FRONTEND_URL");
    const url = `${baseUrl}/reset_password?token=${token}&id=${user.id}`;
    return url;
  }

  async verifyPasswordResetToken(
    verifyPasswordResetTokenDto: VerifyPasswordResetTokenDto,
  ): Promise<boolean> {
    const { token, userId } = verifyPasswordResetTokenDto;
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) return false;
    const dbToken = await this.prisma.token.findUnique({
      where: {
        type_userId: {
          userId: user.id,
          type: "RESET_PASSWORD",
        },
      },
    });
    if (!dbToken) return false;

    const now = Date.now();
    const createdAt = new Date(dbToken.createdAt).getTime();
    const hoursDifference = (now - createdAt) / 1000 / 60 / 60;
    const isValid =
      (await bcrypt.compare(token, dbToken.token)) && hoursDifference < 24;
    if (!isValid) return false;
    return true;
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<GenericResponse> {
    const { token, password, userId } = resetPasswordDto;
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const isValid = await this.verifyPasswordResetToken({ token, userId });
    if (!isValid)
      throw new HttpException(
        "Token is invalid or expired",
        HttpStatus.FORBIDDEN,
      );

    const dbToken = await this.prisma.token.findUnique({
      where: {
        type_userId: {
          userId: user.id,
          type: "RESET_PASSWORD",
        },
      },
    });
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
    await this.prisma.token.delete({
      where: {
        id: dbToken.id,
      },
    });
    await this.emailService.sendPasswordResetConfirmation(user.email);
    return { message: "Password reset successfully" };
  }

  async generateEmailVerificationUrl(email: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user.emailVerified)
      throw new HttpException("User is already verified", HttpStatus.CONFLICT);
    const tokenFound = await this.prisma.token.findUnique({
      where: {
        type_userId: {
          userId: user.id,
          type: "VERIFY_EMAIL",
        },
      },
    });
    if (tokenFound)
      await this.prisma.token.delete({
        where: {
          id: tokenFound.id,
        },
      });

    const token = crypto.randomBytes(32).toString("hex");
    const salt = await bcrypt.genSalt();
    const hashedToken = await bcrypt.hash(token, salt);
    await this.prisma.token.create({
      data: {
        token: hashedToken,
        type: "VERIFY_EMAIL",
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
    const baseUrl = this.configService.get("FRONTEND_URL");
    const url = `${baseUrl}/verify_email?token=${token}&id=${user.id}`;
    return url;
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<GenericResponse> {
    const { token, userId } = verifyEmailDto;
    const dbToken = await this.prisma.token.findUnique({
      where: {
        type_userId: {
          userId,
          type: "VERIFY_EMAIL",
        },
      },
    });
    if (!dbToken)
      throw new HttpException("Invalid token", HttpStatus.FORBIDDEN);

    const isValid = await bcrypt.compare(token, dbToken.token);
    if (!isValid)
      throw new HttpException("Invalid token", HttpStatus.FORBIDDEN);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: { emailVerified: true },
    });
    await this.prisma.token.delete({
      where: {
        id: dbToken.id,
      },
    });
    return { message: "Email verified successfully" };
  }

  async sendVerification(user: User): Promise<GenericResponse> {
    if (user.emailVerified)
      return { message: "Your account is already verified" };
    const { email } = user;
    const verificationUrl = await this.generateEmailVerificationUrl(email);
    await this.emailService.sendEmailVerification(email, verificationUrl);
    return { message: "Verification email has been sent successfully" };
  }

  async changePassword(
    user: User,
    changePasswordDto: ChangePasswordDto,
  ): Promise<GenericResponse> {
    const { oldPassword, newPassword } = changePasswordDto;
    const isValid = user && (await bcrypt.compare(oldPassword, user.password));
    if (!isValid) throw new ForbiddenException("Incorrect password");

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });
    await this.emailService.sendPasswordResetConfirmation(user.email);
    return { message: "Password updated successfully" };
  }
}
