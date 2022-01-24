import { FanMetrics, Metrics } from './simulator.interface';

export const MINER_DOWN_METRICS: Metrics = {
  health: 'down',
  temp1_in: 0,
  temp1_out: 0,
  temp2_in: 0,
  temp2_out: 0,
  temp3_in: 0,
  temp3_out: 0,
  temp4_in: 0,
  temp4_out: 0,
  fan1: 0,
  fan2: 0,
  fan3: 0,
  fan4: 0,
  pool_connection: 'down',
  gigahashrate: 0,
};

export const HOT_AMBIENT_TEMP_FAN_BASE_METRICS: FanMetrics = {
  temp_in: 100,
  temp_out: 100,
  fan_speed: 6000,
};
