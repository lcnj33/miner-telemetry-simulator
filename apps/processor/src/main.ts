import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ProcessorModule } from './processor.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProcessorModule,
    {
      transport: Transport.REDIS,
      options: {
        url: 'redis://localhost:6379',
      },
    },
  );

  app.listen();
}
bootstrap();
