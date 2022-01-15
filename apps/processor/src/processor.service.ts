import { Injectable, Logger } from '@nestjs/common';
import { TelemetryMessage } from 'apps/consumer/src/poller/poller.interface';

@Injectable()
export class ProcessorService {
  private readonly logger = new Logger(ProcessorService.name);

  processTelemetry(telemetryMsg: TelemetryMessage) {
    const { ok } = telemetryMsg;
    if (ok) {
      this.logger.log(`Processing ok message: ${JSON.stringify(telemetryMsg)}`);
    } else {
      this.logger.log(
        `Processing error message: ${JSON.stringify(telemetryMsg)}`,
      );
    }
  }
}
