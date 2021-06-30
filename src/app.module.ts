import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TagsModule } from "./tags/tags.module";
import { NotesModule } from "./notes/notes.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { configValidationSchema } from "./config.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: "postgres",
        autoLoadEntities: true,
        synchronize: true,
        port: configService.get("DB_PORT"),
        host: process.env.WSL_WINDOWS_HOST,
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_DATABASE"),
      }),
    }),
    TagsModule,
    NotesModule,
    AuthModule,
  ],
})
export class AppModule {}
