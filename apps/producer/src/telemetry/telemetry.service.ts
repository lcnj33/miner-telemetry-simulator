import { Injectable, Logger } from '@nestjs/common';
import { SimulatorService } from '../simulator/simulator.service';
import { Telemetry } from './telemetry.interface';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(private simulatorService: SimulatorService) {}

  public getAllMinerIds(): string[] {
    return this.simulatorService.getMinerIds();
  }

  public getTelemetry(id: string): Telemetry {
    this.logger.log(`Request telemetry for miner: ${id}`);
    const { minerInfo, lastMetrics } =
      this.simulatorService.createOrGetMinerSimulationInfo(id);

    return {
      ...minerInfo,
      ...lastMetrics,
      timestamp: Date.now(),
    };
  }
}
