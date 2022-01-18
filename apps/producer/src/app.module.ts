import { Module } from '@nestjs/common';
import { SimulatorModule } from './simulator/simulator.module';
import { TelemetryModule } from './telemetry/telemetry.module';

@Module({
  imports: [TelemetryModule, SimulatorModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
