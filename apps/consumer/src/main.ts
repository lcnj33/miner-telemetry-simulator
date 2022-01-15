import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);

  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.REDIS,
  //     options: {
  //       url: 'redis://localhost:6379',
  //     },
  //   },
  // );

  // app.listen();
}
bootstrap();
