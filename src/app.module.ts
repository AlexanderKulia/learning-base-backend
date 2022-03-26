import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { ChartsModule } from "./charts/charts.module";
import { configValidationSchema } from "./config.schema";
import { NotesModule } from "./notes/notes.module";
import { TagsModule } from "./tags/tags.module";
import { EmailModule } from "./email/email.module";

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
    ChartsModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
