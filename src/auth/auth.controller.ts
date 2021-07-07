import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("/signup")
  signUp(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ message: string }> {
    return this.authService.signUp(authCredentialsDto);
  }

  @Post("/signin")
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

  @Post("/refresh_token")
  async refreshJwtToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.jid;
    const { newAccessToken, newRefreshToken } =
      await this.authService.refreshJwtToken(refreshToken);
    res.cookie("jid", newRefreshToken, { httpOnly: true });

    return { accessToken: newAccessToken };
  }

  @Get("/logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie("jid", "asd", {
      httpOnly: true,
      maxAge: 0,
      expires: new Date(),
    });
    return true;
  }
}
