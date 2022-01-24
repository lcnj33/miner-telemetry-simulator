import { Injectable } from '@nestjs/common';
import { Engine as RuleEngine, Rule } from 'json-rules-engine';
import {
  SuccessMessage,
  TelemetryMessage,
} from 'apps/consumer/src/poller/poller.interface';
import { Telemetry } from 'apps/producer/src/telemetry/telemetry.interface';
import { ReporterService } from '../reporter/reporter.service';
import { RULE_TYPE } from './processor.constants';

@Injectable()
export class ProcessorService {
  private readonly ruleEngine: RuleEngine;

  constructor(private reporterService: ReporterService) {
    this.ruleEngine = new RuleEngine();
    this.ruleEngine.addRule(ProcessorService.buildHealthRule());
    this.ruleEngine.addRule(ProcessorService.buildFanTempRule());
    this.ruleEngine.addRule(ProcessorService.buildFanSpeedRule());
  }

  processTelemetryMessage(telemetryMsg: TelemetryMessage) {
    if (ProcessorService.isSuccessMessgae(telemetryMsg)) {
      this.processTelemetry(telemetryMsg.data);
    } else {
      this.reporterService.reportErrorMessage(telemetryMsg);
    }
  }

  processTelemetry(telemetry: Telemetry): Promise<void> {
    // TODO: can disable any rule when another has been alarmed? maybe exercise the rule in specific order
    return this.ruleEngine.run(telemetry).then((result) => {
      result.failureResults.forEach((failure) => {
        // console.log(`failure: ${JSON.stringify(failure)}`);
        // the sub type is not exported
        const conditions = failure.conditions as any;
        switch (failure.event.type) {
          case RULE_TYPE.MINER_HEALTH: {
            const falseConfition = conditions.all.find(
              (condition: { result: boolean }) => condition.result === false,
            );
            if (falseConfition !== undefined) {
              this.reporterService.reportMinerExeception(
                `Miner health failure. State: ${falseConfition.factResult}.`,
                telemetry,
              );
            }
            break;
          }
          case RULE_TYPE.MINER_FAN_TEMP: {
            const falseConfitions = conditions.all.filter(
              (condition: { result: boolean }) => condition.result === false,
            );
            falseConfitions.forEach(
              (falseConfition: { fact: any; factResult: any }) => {
                this.reporterService.reportMinerExeception(
                  `Miner fan temperature spike. Sensor: ${falseConfition.fact}, Temperature: ${falseConfition.factResult}.`,
                  telemetry,
                );
              },
            );
            break;
          }
          case RULE_TYPE.MINER_FAN_SPEED:
            const falseConfitions = conditions.all.filter(
              (condition: { result: boolean }) => condition.result === false,
            );
            falseConfitions.forEach(
              (falseConfition: { fact: any; factResult: any }) => {
                this.reporterService.reportMinerExeception(
                  `Miner fan failure. Fan: ${falseConfition.fact}, Speed: ${falseConfition.factResult}.`,
                  telemetry,
                );
              },
            );
            break;
        }
      });
    });
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
        type: RULE_TYPE.MINER_HEALTH,
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
        all: nestedConditions,
      },
      event: {
        type: RULE_TYPE.MINER_FAN_TEMP,
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
        all: nestedConditions,
      },
      event: {
        type: RULE_TYPE.MINER_FAN_SPEED,
      },
    });
  }

  private static isSuccessMessgae(
    message: TelemetryMessage,
  ): message is SuccessMessage {
    return message.ok === true;
  }
}
