import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TagsModule } from "./tags/tags.module";
import { NotesModule } from "./notes/notes.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.WSL_WINDOWS_HOST,
      port: 5432,
      username: "postgres",
      password: "password",
      database: "learning-base",
      autoLoadEntities: true,
      synchronize: true,
    }),
    TagsModule,
    NotesModule,
    AuthModule,
  ],
})
export class AppModule {}
