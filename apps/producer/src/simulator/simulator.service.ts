import { Injectable, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FanMetrics, HealthState, Metrics } from './simulator.interface';

@Injectable()
export class SimulatorService implements OnModuleInit {
  miners: Record<string, Metrics | undefined> = {};
  ambientTemp = 30; // Celsius

  onModuleInit() {
    this.addMiners(10);
  }

  addMiners(num: number) {
    const miners = Object.fromEntries(
      Array(num)
        .fill(undefined)
        .map(() => {
          return [this.generateMinerId(), undefined];
        }),
    );

    Object.assign(this.miners, miners);
  }

  getAbientTemp(): number {
    return this.ambientTemp;
  }

  getMinerIds(): string[] {
    return Object.keys(this.miners);
  }

  getMinerMetrics(id: string): Metrics | undefined {
    const metrics = this.miners[id];
    if (metrics !== undefined) {
      this.miners[id] = undefined;
      return metrics;
    }
    return this.generateMinerMetrics();
  }

  generateMinerId(): string {
    return uuidv4();
  }

  generateMinerMetrics(): Metrics {
    const fan1 = this.generateFanMetrics();
    const fan2 = this.generateFanMetrics();
    const fan3 = this.generateFanMetrics();
    const fan4 = this.generateFanMetrics();

    return {
      health: this.generateHealth(),
      temp1_in: fan1.temp_in,
      temp1_out: fan1.temp_out,
      temp2_in: fan2.temp_in,
      temp2_out: fan2.temp_out,
      temp3_in: fan3.temp_in,
      temp3_out: fan3.temp_out,
      temp4_in: fan4.temp_in,
      temp4_out: fan4.temp_out,
      fan1: fan1.fan_speed,
      fan2: fan2.fan_speed,
      fan3: fan3.fan_speed,
      fan4: fan4.fan_speed,
      gigahashrate: this.generateiGgahashrate(),
    };
  }

  generateFanMetrics(): FanMetrics {
    const tempIn = this.generateFanInTemp();
    const tempOut = this.generateFanOutTemp(tempIn);
    const fanSpeed = this.generateFanSpeed();

    return {
      temp_in: tempIn,
      temp_out: tempOut, // TODO: temp out should be larger than temp in
      fan_speed: fanSpeed, // TODO: static?
    };
  }

  private static randomIntBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private static randomIntWithWeights(weights: number[]) {
    const cumulativeWeights = weights.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0),
    );

    const rand =
      cumulativeWeights[cumulativeWeights.length - 1] * Math.random();
    for (let i = 0; i < weights.length; i++) {
      if (rand <= cumulativeWeights[i]) {
        return i;
      }
    }
  }

  generateFanInTemp(): number {
    // sensor normal range 50-85, too high or low will trigger auto-protection
    // recommanded ambient temp 15-35
    // possible running ambient temp range 0-40

    if (this.ambientTemp > 40) {
      return SimulatorService.randomIntBetween(85, 120);
    } else if (this.ambientTemp < 0) {
      return SimulatorService.randomIntBetween(40, 60);
    } else {
      let rand: number;
      if (this.ambientTemp < 15) {
        // might be too cold
        rand = SimulatorService.randomIntWithWeights([25, 50, 20, 5]);
      } else if (this.ambientTemp > 35) {
        // might be too hot
        rand = SimulatorService.randomIntWithWeights([5, 10, 40, 45]);
      } else {
        // ideal temp
        rand = SimulatorService.randomIntWithWeights([5, 70, 20, 5]);
      }

      switch (rand) {
        case 0: // cold: 10 - 60
          return SimulatorService.randomIntBetween(10, 60);
        case 1: // normal: 55 - 70
          return SimulatorService.randomIntBetween(55, 70);
        case 2: // less normal: 70 - 85
          return SimulatorService.randomIntBetween(60, 85);
        case 3: // hot: 85+
          return SimulatorService.randomIntBetween(85, 120);
      }
    }
  }

  generateFanOutTemp(tempIn: number): number {
    const rand = SimulatorService.randomIntWithWeights([70, 20, 10]);
    let tempDiff: number;
    switch (rand) {
      case 0:
        tempDiff = SimulatorService.randomIntBetween(5, 10);
        break;
      case 1:
        tempDiff = SimulatorService.randomIntBetween(10, 15);
        break;
      case 2:
        tempDiff = SimulatorService.randomIntBetween(15, 25);
        break;
    }

    return tempIn + tempDiff;
  }

  generateFanSpeed(): number {
    // TODO: if fan is static, then no need to consider temp
    const rand = SimulatorService.randomIntWithWeights([10, 10, 80]); // 10 10 80
    switch (rand) {
      case 0:
        return SimulatorService.randomIntBetween(0, 10);
      case 1: {
        const speed = SimulatorService.randomIntBetween(6600, 10000);
        return Math.round(speed / 100) * 100;
      }
      case 2: {
        const speed = SimulatorService.randomIntBetween(5700, 6500);
        return Math.round(speed / 100) * 100;
      }
    }
  }

  generateHealth(): HealthState {
    const rand = SimulatorService.randomIntWithWeights([95, 5]);
    return rand === 0 ? 'up' : 'down';
  }

  generateiGgahashrate(): number {
    return 100671.28;
  }

  setMinerMetrics(id: string, metrics: Metrics) {
    this.miners[id] = metrics;
  }

  setAmbientTemp(temp: number) {
    this.ambientTemp = temp;
  }
}
