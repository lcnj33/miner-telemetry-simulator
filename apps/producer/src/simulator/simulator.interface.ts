export interface MinerSimulationInfo {
  minerInfo: MinerInfo;
  lastMetrics: Metrics | undefined;
  up_timestamp: number;
}

export interface MinerInfo {
  id: string;
  location: MinerLocation;
}

export interface MinerLocation {
  zone: string;
  rack: number;
  shelf: number;
}

export interface Metrics {
  health: HealthState;
  temp1_in: FanMetrics['temp_in'];
  temp1_out: FanMetrics['temp_out'];
  temp2_in: FanMetrics['temp_in'];
  temp2_out: FanMetrics['temp_out'];
  temp3_in: FanMetrics['temp_in'];
  temp3_out: FanMetrics['temp_out'];
  temp4_in: FanMetrics['temp_in'];
  temp4_out: FanMetrics['temp_out'];
  fan1: number;
  fan2: number;
  fan3: number;
  fan4: number;
  gigahashrate: number;
  pool_connection: HealthState;
}

export interface FanMetrics {
  temp_in: number;
  temp_out: number;
  fan_speed: number;
}

export type HealthState = 'up' | 'down';
