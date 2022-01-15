import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PollerModule } from './poller/poller.module';

@Module({
  imports: [ScheduleModule.forRoot(), PollerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
