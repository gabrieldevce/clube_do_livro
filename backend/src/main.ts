import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://frontend-chi-vert-89.vercel.app',
      /\.vercel\.app$/,
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
