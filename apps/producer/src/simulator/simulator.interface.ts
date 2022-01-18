interface Telemetry {
  minerInfo: {
    id: string;
    location: {
      zone: string;
      aisle: number;
      rack: number;
      shelf: number;
      position: number;
    };
  };
  healthMetrics: Metrics;
  poolStatus: {
    connection_status: 'up' | 'down';
  };
  timestamp: number; // UTC
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
}

export interface FanMetrics {
  temp_in: number;
  temp_out: number;
  fan_speed: number;
}

export type HealthState = 'up' | 'down';
