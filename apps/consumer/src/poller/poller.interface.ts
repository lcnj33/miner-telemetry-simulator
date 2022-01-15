import { Telemetry } from 'apps/producer/src/telemetry/telemetry.interface';

export type TelemetryMessage = SuccessMessage | ErrorMessage;

export interface SuccessMessage extends MinerInfo {
  ok: true;
  data: Telemetry;
}

export interface ErrorMessage extends MinerInfo {
  ok: false;
  error: unknown;
}

interface MinerInfo {
  miner_id: string;
}
