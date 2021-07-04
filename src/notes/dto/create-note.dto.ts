import { IsNotEmpty, MaxLength } from "class-validator";

export class CreateNoteDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @MaxLength(20, {
    each: true,
  })
  tags: string[];
}
