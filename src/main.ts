import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import fs from "fs";
import { AppModule } from "./app.module";
import { PrismaService } from "./prisma.service";

async function bootstrap() {
  let app: INestApplication;

  if (process.env.STAGE === "prod") {
    const httpsOptions = {
      key: fs.readFileSync("/etc/letsencrypt/live/kaaprojects.com/privkey.pem"),
      cert: fs.readFileSync(
        "/etc/letsencrypt/live/kaaprojects.com/fullchain.pem",
      ),
    };

    app = await NestFactory.create(AppModule, { httpsOptions });
  } else {
    app = await NestFactory.create(AppModule);
  }

  const configService = app.get(ConfigService);

  app.enableCors({
    credentials: true,
    origin: configService.get("FRONTEND_URL"),
  });
  app.use(cookieParser());

  const prismaService: PrismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  const config = new DocumentBuilder()
    .setTitle("Learning Base")
    .setDescription("Learning Base API Documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(configService.get("PORT"));
}
bootstrap();
