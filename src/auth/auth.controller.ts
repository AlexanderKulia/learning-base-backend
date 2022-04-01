import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { User } from "@prisma/client";
import { Request, Response } from "express";
import { GenericResponse } from "../types";
import { AuthService } from "./auth.service";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { VerifyPasswordResetTokenDto } from "./dto/verify-password-reset-token.dto";
import { GetUser } from "./get-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  signUp(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<GenericResponse> {
    return this.authService.signUp(authCredentialsDto);
  }

  @Post("signin")
  async signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.authService.signIn(
      authCredentialsDto,
    );
    res.cookie("jid", refreshToken, { httpOnly: true });

    return { accessToken };
  }

  @Post("refresh_token")
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const refreshToken = req.cookies.jid;
    const { newAccessToken, newRefreshToken } =
      await this.authService.refreshTokens(refreshToken);
    res.cookie("jid", newRefreshToken, { httpOnly: true });

    return { accessToken: newAccessToken };
  }

  @Get("logout")
  logout(@Res({ passthrough: true }) res: Response): boolean {
    res.cookie("jid", "asd", {
      httpOnly: true,
      maxAge: 0,
      expires: new Date(),
    });
    return true;
  }

  @Get("verify_user")
  verifyCurrentUser(@Req() req: Request): boolean {
    const refreshToken = req.cookies.jid;
    return this.authService.verifyCurrentUser(refreshToken);
  }

  @Post("forgot_password")
  sendPasswordReset(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<GenericResponse> {
    return this.authService.sendPasswordReset(forgotPasswordDto);
  }

  @Post("verify_password_token")
  verifyPasswordResetToken(
    @Body() verifyPasswordResetTokenDto: VerifyPasswordResetTokenDto,
  ): Promise<boolean> {
    return this.authService.verifyPasswordResetToken(
      verifyPasswordResetTokenDto,
    );
  }

  @Post("reset_password")
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<GenericResponse> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post("verify_email")
  verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<GenericResponse> {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @UseGuards(AuthGuard())
  @Get("send_verification")
  sendVerification(@GetUser() user: User): Promise<GenericResponse> {
    return this.authService.sendVerification(user);
  }

  @UseGuards(AuthGuard())
  @Post("change_password")
  changePassword(
    @GetUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<GenericResponse> {
    return this.authService.changePassword(user, changePasswordDto);
  }
}
