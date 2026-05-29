import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function parseCorsOrigins(): string[] {
  const origins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
    : [
        'gotsawa9.vercel.app',
        'http://localhost:3000',
        'http://localhost:3002',
        'http://localhost:3003',
      ];

  const normalized: string[] = [];
  for (const o of origins) {
    if (/^https?:\/\//.test(o)) {
      normalized.push(o);
    } else {
      normalized.push(`http://${o}`);
      normalized.push(`https://${o}`);
    }
  }
  return normalized;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

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
      if (LOCALHOST_ORIGIN.test(origin)) {
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
