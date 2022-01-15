import { Module } from '@nestjs/common';
import { TelemetryModule } from './telemetry/telemetry.module';

@Module({
  imports: [TelemetryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
