import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PollerController } from './poller.controller';
import { PollerService } from './poller.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ClientsModule.register([
      {
        name: 'PUBSUB',
        transport: Transport.REDIS,
        options: {
          url: 'redis://localhost:6379',
        },
      },
    ]),
  ],
  controllers: [PollerController],
  providers: [PollerService],
})
export class PollerModule {}
