import { Injectable, Logger } from '@nestjs/common';
import { Engine as RuleEngine, Rule } from 'json-rules-engine';
import { TelemetryMessage } from 'apps/consumer/src/poller/poller.interface';
import { Telemetry } from 'apps/producer/src/telemetry/telemetry.interface';

@Injectable()
export class ProcessorService {
  private readonly logger = new Logger(ProcessorService.name);
  private readonly ruleEngine: RuleEngine;

  constructor() {
    this.ruleEngine = new RuleEngine();
    this.ruleEngine.addRule(ProcessorService.buildHealthRule());
    this.ruleEngine.addRule(ProcessorService.buildFanTempRule());
    this.ruleEngine.addRule(ProcessorService.buildFanSpeedRule());
  }

  private static buildHealthRule(): Rule {
    return new Rule({
      conditions: {
        all: [
          {
            fact: 'health',
            operator: 'equal',
            value: 'up',
          },
        ],
      },
      event: {
        type: 'miner-health',
      },
    });
  }

  private static buildFanTempRule(): Rule {
    const nestedConditions = [1, 2, 3, 4].flatMap((num) => [
      {
        fact: `temp${num}_in`,
        operator: 'lessThan',
        value: 85,
      },
      {
        fact: `temp${num}_out`,
        operator: 'lessThan',
        value: 85,
      },
    ]);

    return new Rule({
      conditions: {
        any: nestedConditions,
      },
      event: {
        type: 'miner-fan-temp',
      },
    });
  }

  private static buildFanSpeedRule(): Rule {
    const nestedConditions = [1, 2, 3, 4].map((num) => {
      return {
        fact: `fan${num}`,
        operator: 'greaterThan',
        value: 10,
      };
    });

    return new Rule({
      conditions: {
        any: nestedConditions,
      },
      event: {
        type: 'miner-fan-speed',
      },
    });
  }

  processTelemetryMessage(telemetryMsg: TelemetryMessage) {
    const { ok } = telemetryMsg;
    if (ok) {
      //   this.logger.log(
      //     `Processing ok message: ${JSON.stringify(telemetryMsg, null, 2)}`,
      //   );
      this.processTelemetry(telemetryMsg.data);
    } else {
      this.logger.log(
        `Processing error message: ${JSON.stringify(telemetryMsg)}`,
      );
    }
  }

  processTelemetry(telemetry: Telemetry) {
    this.ruleEngine.run(telemetry).then((result) => {
      result.failureResults.forEach((failure) => {
        // this.logger.debug(`### Failure result: ${JSON.stringify(failure)}`);
        // the sub type is not exported
        const conditions = failure.conditions as any;
        switch (failure.event.type) {
          case 'miner-health': {
            const falseConfition = conditions.all.find(
              (condition: { result: boolean }) => condition.result === false,
            );
            if (falseConfition !== undefined) {
              this.logger.error(
                `Found miner health failure. Miner ID: ${telemetry.id}, State: ${falseConfition.factResult}`,
              );
            }
            break;
          }
          case 'miner-fan-temp': {
            const falseConfitions = conditions.any.filter(
              (condition: { result: boolean }) => condition.result === false,
            );
            falseConfitions.forEach(
              (falseConfition: { fact: any; factResult: any }) => {
                this.logger.error(
                  `Found miner fan temperature spike. Miner ID: ${telemetry.id}, Fan: ${falseConfition.fact} ${falseConfition.factResult}`,
                );
              },
            );
            break;
          }
          case 'miner-fan-speed':
            const falseConfitions = conditions.any.filter(
              (condition: { result: boolean }) => condition.result === false,
            );
            falseConfitions.forEach(
              (falseConfition: { fact: any; factResult: any }) => {
                this.logger.error(
                  `Found miner fan failure. Miner ID: ${telemetry.id}, Fan: ${falseConfition.fact} ${falseConfition.factResult}`,
                );
              },
            );
            break;
        }
      });
    });
  }
}
