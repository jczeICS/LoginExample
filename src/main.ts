import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { log } from 'console';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  log(`Server running on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
