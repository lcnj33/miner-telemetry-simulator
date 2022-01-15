import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Telemetry } from './telemetry.interface';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private miners = { '123': { name: 'miner123' }, '456': { name: 'miner456' } };

  public getAllMinerIds(): string[] {
    return Object.keys(this.miners);
  }

  public getMinerIdsForFleet(fleetId): string[] {
    return [];
  }

  public getTelemetry(id: string): Telemetry {
    this.logger.log(`requestedID: ${id}`);

    if (this.miners[id] === undefined) {
      throw new NotFoundException(`Miner ${id} not found.`);
    }

    // TODO: create simulator
    return {
      id,
      health: 'up',
      temp1_in: 58,
      temp1_out: 63,
      temp2_in: 57,
      temp2_out: 62,
      temp3_in: 59,
      temp3_out: 64,
      temp4_in: 54,
      temp4_out: 59,
      fan1: 6000,
      fan2: 5800,
      fan3: 5900,
      fan4: 6100,
      gigahashrate: 100671.28,
    };
  }
}
