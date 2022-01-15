export interface Telemetry {
  id: string;
  health: 'up' | 'down';
  temp1_in: number;
  temp1_out: number;
  temp2_in: number;
  temp2_out: number;
  temp3_in: number;
  temp3_out: number;
  temp4_in: number;
  temp4_out: number;
  fan1: number;
  fan2: number;
  fan3: number;
  fan4: number;
  gigahashrate: number;
}
