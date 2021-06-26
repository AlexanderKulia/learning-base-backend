import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TagsModule } from "./tags/tags.module";
import { NotesModule } from "./notes/notes.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "172.22.176.1",
      port: 5432,
      username: "postgres",
      password: "password",
      database: "learning-base",
      autoLoadEntities: true,
      synchronize: true,
    }),
    TagsModule,
    NotesModule,
  ],
})
export class AppModule {}
