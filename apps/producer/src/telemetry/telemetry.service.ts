import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SimulatorService } from '../simulator/simulator.service';
import { Telemetry } from './telemetry.interface';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(private simulatorService: SimulatorService) {}

  public getAllMinerIds(): string[] {
    // return Object.keys(this.simulatorService);
    return this.simulatorService.getMinerIds();
  }

  public getTelemetry(id: string): Telemetry {
    this.logger.log(`requestedID: ${id}`);
    const metrics = this.simulatorService.getMinerMetrics(id);

    if (metrics === undefined) {
      throw new NotFoundException(`Miner ${id} not found.`);
    }

    return {
      id,
      ...metrics,
    };
  }
}
