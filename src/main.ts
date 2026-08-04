import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerConfigInit } from './config/swagger.config';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  SwaggerConfigInit(app);
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, () => {
    console.log(`http://localhost:${port}`);
    console.log(`swagger: http://localhost:${port}/swagger`);
  });
}

bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});
