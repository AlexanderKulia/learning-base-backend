import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { TransformInterceptor } from "./transform.interceptor";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const configService = new ConfigService();

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: configService.get("FRONTEND_URL"),
  });
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle("Learning Base")
    .setDescription("Learning Base API Documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(configService.get("PORT"));
}
bootstrap();
