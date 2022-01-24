import { Injectable, Logger } from '@nestjs/common';
import { ErrorMessage } from 'apps/consumer/src/poller/poller.interface';
import { Telemetry } from 'apps/producer/src/telemetry/telemetry.interface';

@Injectable()
export class ReporterService {
  private readonly logger = new Logger(ReporterService.name);

  reportErrorMessage(msg: ErrorMessage) {
    this.logger.log(
      `Received error message from channel: ${JSON.stringify(msg)}`,
    );
  }

  reportMinerExeception(msg: string, telemetry: Telemetry) {
    const { id: minerId, timestamp } = telemetry;
    this.logger.error(
      `Miner exception occurred! ${msg}\n` +
        `Miner ID: ${minerId}\n` +
        `Polling Time: ${new Date(timestamp).toISOString()}`,
    );
  }
}
