import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { ProcessorService } from './processor.service';
import { TelemetryMessage } from 'apps/consumer/src/poller/poller.interface';

@Controller()
export class ProcessorController {
  private readonly logger = new Logger(ProcessorService.name);
  constructor(private readonly processorService: ProcessorService) {}

  @EventPattern('telemetry')
  process(telemetryMsg: TelemetryMessage) {
    this.processorService.processTelemetry(telemetryMsg);
  }
}
