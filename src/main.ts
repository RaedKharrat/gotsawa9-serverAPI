import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function parseCorsOrigins(): string[] {
  if (process.env.CORS_ORIGIN) {
    return process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
  }
  return [
    'gotsawa9.vercel.app',
    'http://localhost:3002',
    'http://localhost:3003',
  ];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = parseCorsOrigins();

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (!isProduction && LOCALHOST_ORIGIN.test(origin)) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  });

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  await app.listen(3001);
}
bootstrap();
// Trigger restart
