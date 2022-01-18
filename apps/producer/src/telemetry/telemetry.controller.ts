import { Controller, Get, Param } from '@nestjs/common';
import { Telemetry } from './telemetry.interface';
import { TelemetryService } from './telemetry.service';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get()
  public getMinerIds(): string[] {
    return this.telemetryService.getAllMinerIds();
  }

  @Get(':id')
  public getTelemetry(@Param('id') id: string): Telemetry {
    return this.telemetryService.getTelemetry(id);
  }
}
