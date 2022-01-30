import { Injectable } from '@nestjs/common';
import { Engine as RuleEngine } from 'json-rules-engine';
import {
  SuccessMessage,
  TelemetryMessage,
} from 'apps/consumer/src/poller/poller.interface';
import { Telemetry } from 'apps/producer/src/telemetry/telemetry.interface';
import { ReporterService } from '../reporter/reporter.service';
import { RULE_TYPE } from './processor.constants';
import { RULES } from './processor.rules';

@Injectable()
export class ProcessorService {
  private readonly ruleEngine: RuleEngine;
  private minersState: Record<string, Telemetry> = {};

  constructor(private reporterService: ReporterService) {
    this.ruleEngine = new RuleEngine();
    RULES.forEach((rule) => {
      this.ruleEngine.addRule(rule);
    });
  }

  processTelemetryMessage(telemetryMsg: TelemetryMessage) {
    if (ProcessorService.isSuccessMessgae(telemetryMsg)) {
      this.processTelemetry(telemetryMsg.data);
    } else {
      this.reporterService.reportErrorMessage(telemetryMsg);
    }
  }

  async processTelemetry(telemetry: Telemetry) {
    const { id } = telemetry;
    if (this.minersState[id] === undefined) {
      this.minersState[id] = telemetry;
      return;
    }

    const facts = {
      previous: this.minersState[id],
      incoming: telemetry,
    };

    this.minersState[id] = telemetry;

    const runResult = await this.ruleEngine.run(facts);

    runResult.results.forEach((result) => {
      const conditions = result.conditions as any;
      switch (result.event.type) {
        case RULE_TYPE.MINER_HEALTH: {
          const condition = conditions.all.find(
            (condition: { fact: string }) => condition.fact === 'incoming',
          );
          if (condition !== undefined) {
            this.reporterService.reportMinerExeception(
              `Miner health failure. State: ${condition.factResult}.`,
              telemetry,
            );
          }
          break;
        }
        case RULE_TYPE.POOL_CONNECTION: {
          const condition = conditions.all.find(
            (condition: { fact: string }) => condition.fact === 'incoming',
          );
          if (condition !== undefined) {
            this.reporterService.reportMinerExeception(
              `Miner is diconnected with the configured pool. State: ${condition.factResult}.`,
              telemetry,
            );
          }
          break;
        }
        case RULE_TYPE.GIGAHASH_RATE: {
          const condition = conditions.all.find(
            (condition: { fact: string }) => condition.fact === 'incoming',
          );
          if (condition !== undefined) {
            this.reporterService.reportMinerExeception(
              `Detected a dip in gigahashrate. Gigahashrate: ${condition.factResult}.`,
              telemetry,
            );
          }
          break;
        }
        case RULE_TYPE.MINER_FAN_SPEED: {
          const matches = conditions.any.filter(
            (anyCondition: { all: any }) => {
              return anyCondition.all[0].result && anyCondition.all[1].result;
            },
          );

          if (matches.length === 4) {
            this.reporterService.reportMinerExeception(
              'Detected all fans down failure.',
              telemetry,
            );
          } else {
            matches.forEach((anyCondition: { all: any }) => {
              const incoming = anyCondition.all[1];
              this.reporterService.reportMinerExeception(
                `Detected a fan failure. Fan: ${incoming.path}, Speed: ${incoming.factResult}.`,
                telemetry,
              );
            });
          }
          break;
        }
        case RULE_TYPE.MINER_FAN_TEMP: {
          const matches = conditions.any.filter(
            (anyCondition: { all: any }) => {
              return anyCondition.all[0].result && anyCondition.all[1].result;
            },
          );

          if (matches.length > 3) {
            this.reporterService.reportMinerExeception(
              'Detected multiple fans temperature spike. There could be an ambient temperature rise.',
              telemetry,
            );
          } else {
            matches.forEach((anyCondition: { all: any }) => {
              const incoming = anyCondition.all[1];
              this.reporterService.reportMinerExeception(
                `Detected a fan temperature spike. Sensor: ${incoming.path}, Temperature: ${incoming.factResult}.`,
                telemetry,
              );
            });
          }
          break;
        }
        case RULE_TYPE.AMBIENT_TEMP: {
          this.reporterService.reportMinerExeception(
            `Detected all fans temperature spike. There could be an ambient temperature rise.`,
            telemetry,
          );
          break;
        }
      }
    });
  }

  private static isSuccessMessgae(
    message: TelemetryMessage,
  ): message is SuccessMessage {
    return message.ok === true;
  }
}
