import { Metrics } from '../simulator/simulator.interface';

export interface Telemetry extends Metrics {
  id: string;
}
