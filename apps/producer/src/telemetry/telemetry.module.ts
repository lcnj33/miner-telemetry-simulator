import { Module } from '@nestjs/common';
import { SimulatorModule } from '../simulator/simulator.module';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';

@Module({
  imports: [SimulatorModule],
  controllers: [TelemetryController],
  providers: [TelemetryService],
})
export class TelemetryModule {}
