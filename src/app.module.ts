import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { configValidationSchema } from "./config.schema";
import { NotesModule } from "./notes/notes.module";
import { TagsModule } from "./tags/tags.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env`],
      validationSchema: configValidationSchema,
      expandVariables: true,
    }),
    ConfigModule,
    TagsModule,
    NotesModule,
    AuthModule,
  ],
})
export class AppModule {}
