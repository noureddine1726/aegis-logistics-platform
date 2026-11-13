import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allows your Next.js frontend to talk to this NestJS backend
  app.enableCors();

  await app.listen(3000);
  console.log(`Aegis Backend is running on: http://localhost:3000`);
}
bootstrap();