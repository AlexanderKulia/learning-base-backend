import { IsEmail, IsString, Length, Matches } from "class-validator";

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 36)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: "Password is too weak",
  })
  password: string;
}
