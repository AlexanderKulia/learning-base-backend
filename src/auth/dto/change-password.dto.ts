import { IsString, Length, Matches } from "class-validator";

export class ChangePasswordDto {
  oldPassword: string;

  @IsString()
  @Length(8, 36)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: "Password is too weak",
  })
  newPassword: string;
}
