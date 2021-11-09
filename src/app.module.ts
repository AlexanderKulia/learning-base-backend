import { Module } from "@nestjs/common";
import { TagsModule } from "./tags/tags.module";
import { NotesModule } from "./notes/notes.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { configValidationSchema } from "./config.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env`],
      validationSchema: configValidationSchema,
    }),
    ConfigModule,
    TagsModule,
    NotesModule,
    AuthModule,
  ],
})
export class AppModule {}
