import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());

  // Get the CORS_ORIGIN env variable (could be comma-separated)
  const origins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000']; // fallback for local dev

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();