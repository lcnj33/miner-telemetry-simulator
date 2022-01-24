import { Injectable } from '@nestjs/common';
import {
  HOT_AMBIENT_TEMP_FAN_BASE_METRICS,
  MINER_DOWN_METRICS,
} from './simulator.constants';
import {
  FanMetrics,
  HealthState,
  Metrics,
  MinerInfo,
  MinerLocation,
  MinerSimulationInfo,
} from './simulator.interface';

@Injectable()
export class SimulatorService {
  private miners: Record<string, MinerSimulationInfo> = {};
  private ambientTemp = 30; // Celsius
  private lastCreatedMiner: MinerInfo;

  getAmbientTemp(): number {
    return this.ambientTemp;
  }

  setAmbientTemp(temp: number) {
    this.ambientTemp = temp;
  }

  getMinerIds(): string[] {
    return Object.keys(this.miners);
  }

  createOrGetMinerSimulationInfo(id: string): MinerSimulationInfo {
    let minerSimInfo = this.miners[id];
    if (minerSimInfo === undefined) {
      minerSimInfo = this.miners[id] = this.createMinerSimulationInfo(id);
    }

    const currentMetrics = this.generateMinerMetrics(minerSimInfo.lastMetrics);
    minerSimInfo.lastMetrics = currentMetrics;

    return minerSimInfo;
  }

  private createMinerSimulationInfo(id: string): MinerSimulationInfo {
    const minerInfo = this.deployNextMiner(id);

    return {
      minerInfo,
      lastMetrics: undefined,
      up_timestamp: Date.now(),
    };
  }

  private deployNextMiner(id: string) {
    let nextMiner: MinerInfo;
    if (this.lastCreatedMiner === undefined) {
      nextMiner = {
        id,
        location: {
          zone: 'Green',
          rack: 1,
          shelf: 1,
        },
      };
    } else {
      nextMiner = {
        id,
        location: SimulatorService.getNextLocation(
          this.lastCreatedMiner.location,
        ),
      };
    }

    this.lastCreatedMiner = nextMiner;
    return nextMiner;
  }

  private generateMinerMetrics(baseMetrics: Metrics | undefined): Metrics {
    // recommanded ambient temp 15-35
    // possible running ambient temp range 0-40
    if (this.ambientTemp < 10) {
      // all miners down
      return MINER_DOWN_METRICS;
    }

    if (this.ambientTemp > 40) {
      const { temp_in } = HOT_AMBIENT_TEMP_FAN_BASE_METRICS;
      const fan1 = this.generateFanMetrics(temp_in);
      const fan2 = this.generateFanMetrics(temp_in);
      const fan3 = this.generateFanMetrics(temp_in);
      const fan4 = this.generateFanMetrics(temp_in);

      return {
        health: 'down',
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
        pool_connection: 'down',
        gigahashrate: 0,
      };
    }

    const minerHealth = this.generateHealth(baseMetrics?.health);

    const fans = this.generateFansMetrics(baseMetrics);

    const poolConnHealth = this.generateHealth(baseMetrics?.pool_connection);
    const gigahashrate = this.generateiGgahashrate(poolConnHealth);

    return {
      health: minerHealth,
      temp1_in: fans[0].temp_in,
      temp1_out: fans[0].temp_out,
      temp2_in: fans[1].temp_in,
      temp2_out: fans[1].temp_out,
      temp3_in: fans[2].temp_in,
      temp3_out: fans[2].temp_out,
      temp4_in: fans[3].temp_in,
      temp4_out: fans[3].temp_out,
      fan1: fans[0].fan_speed,
      fan2: fans[1].fan_speed,
      fan3: fans[2].fan_speed,
      fan4: fans[3].fan_speed,
      pool_connection: poolConnHealth,
      gigahashrate: gigahashrate,
    };
  }

  private generateFansMetrics(baseMetrics?: Metrics): FanMetrics[] {
    if (baseMetrics === undefined) {
      return Array.from({ length: 4 }, () => this.generateFanMetrics());
    }

    return Array.from({ length: 4 }, (_element, index) => {
      const fanIn = baseMetrics[`temp${index + 1}_in`];
      return this.generateFanMetrics(fanIn);
    });
  }

  private generateFanMetrics(previousTempIn?: number): FanMetrics {
    const tempIn = this.generateFanInTemp(previousTempIn);
    const tempOut = this.generateFanOutTemp(tempIn);
    const fanSpeed = this.generateFanSpeed();

    return {
      temp_in: tempIn,
      temp_out: tempOut,
      fan_speed: fanSpeed,
    };
  }

  private generateFanInTemp(previousValue?: number): number {
    // sensor normal range 50-85, too high or low will trigger auto-protection

    const baseValue = previousValue ? previousValue : 55;

    let normalOrHot: number;
    if (this.ambientTemp > 35) {
      // hot ambient temp
      normalOrHot = SimulatorService.randomIntWithWeights([70, 30]);
    } else {
      // ideal ambient temp
      normalOrHot = SimulatorService.randomIntWithWeights([90, 10]);
    }

    switch (normalOrHot) {
      case 0: {
        // go normal: 50 - 60
        // return SimulatorService.randomIntBetween(50, 60);
        const rand = SimulatorService.randomIntBetween(0, 10);
        const plusOrMinus = Math.random() < 0.5 ? -1 : 1;

        if (previousValue > 80 && Math.random() < 0.5) {
          // when normal ambient temp, hot sensor may be back to normal
          return 55;
        }
        return baseValue + rand * plusOrMinus;
      }
      case 1: {
        // go hot: 85+
        // return SimulatorService.randomIntBetween(85, 120);
        // if previous temp is smaller then 80, then go up 30-40
        const rand =
          previousValue < 80
            ? SimulatorService.randomIntBetween(30, 50)
            : SimulatorService.randomIntBetween(0, 5);
        return baseValue + rand;
      }
    }
  }

  private generateFanOutTemp(tempIn: number): number {
    const rand = SimulatorService.randomIntWithWeights([90, 10]);
    switch (rand) {
      case 0:
        return tempIn + SimulatorService.randomIntBetween(5, 10);
      case 1:
        return tempIn + SimulatorService.randomIntBetween(40, 50);
    }
  }

  private generateFanSpeed(): number {
    const rand = SimulatorService.randomIntWithWeights([10, 90]);
    switch (rand) {
      case 0:
        return 0;
      case 1: {
        const speed = SimulatorService.randomIntBetween(5700, 6500);
        return Math.round(speed / 100) * 100;
      }
    }
  }

  private generateHealth(previousState?: HealthState): HealthState {
    const rand =
      previousState === 'down'
        ? SimulatorService.randomIntWithWeights([30, 70])
        : SimulatorService.randomIntWithWeights([95, 5]);
    return rand === 0 ? 'up' : 'down';
  }

  private generateiGgahashrate(poolConnHealth: HealthState): number {
    if (poolConnHealth === 'down') {
      return 0;
    }
    // sample: 100671.28
    return SimulatorService.randomNumberBetween(90000, 101000);
  }

  private static randomIntBetween(min: number, max: number) {
    return Math.floor(SimulatorService.randomNumberBetween(min, max));
  }

  private static randomNumberBetween(min: number, max: number) {
    return Math.random() * (max - min + 1) + min;
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

  private static getNextLocation(location: MinerLocation): MinerLocation {
    const { rack, shelf } = location;
    if (shelf < 5) {
      return {
        ...location,
        shelf: shelf + 1,
      };
    }

    return {
      ...location,
      rack: rack + 1,
      shelf: 1,
    };
  }
}
