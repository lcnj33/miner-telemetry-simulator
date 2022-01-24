import { Metrics, MinerInfo } from '../simulator/simulator.interface';

export interface Telemetry extends Metrics, MinerInfo {
  timestamp: number;
}
