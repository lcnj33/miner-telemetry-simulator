import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { each as asyncEach } from 'async';
import { Telemetry } from 'apps/producer/src/telemetry/telemetry.interface';
import { ErrorMessage, SuccessMessage } from './poller.interface';

@Injectable()
export class PollerService implements OnModuleInit {
  private readonly logger = new Logger(PollerService.name);
  private readonly TELEMETRY_ENDPOINT: string;
  private readonly MSG_CHANNEL_NAME: string;

  private minerIds: string[];

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @Inject('PUBSUB') private client: ClientProxy,
  ) {
    this.TELEMETRY_ENDPOINT = this.configService.get<string>(
      'poller.telemetryEndpoint',
    );
    this.MSG_CHANNEL_NAME = this.configService.get<string>(
      'poller.messageChannelName',
    );
  }

  onModuleInit() {
    const numOfMiners = this.configService.get<number>('poller.numberOfMiners');
    this.minerIds = Array.from({ length: numOfMiners }, () => uuidv4());
    this.logger.debug(
      `Poller is configured with ${numOfMiners} miners:\n${this.minerIds.join(
        '\n',
      )}`,
    );
  }

  @Interval(10000)
  poll() {
    this.logger.log('Polling miner metrics...');
    asyncEach(this.minerIds, (id) => {
      this.httpService
        .get<Telemetry>(`${this.TELEMETRY_ENDPOINT}/${id}`)
        .subscribe({
          next: (resp) => {
            this.logger.debug(JSON.stringify(resp.data));
            this.client.emit<undefined, SuccessMessage>(this.MSG_CHANNEL_NAME, {
              ok: true,
              miner_id: id,
              data: resp.data,
            });
          },
          error: (error) => {
            this.logger.error(
              `Error occured when polling miner ${id}: ${JSON.stringify(
                error,
              )}`,
            );

            this.client.emit<undefined, ErrorMessage>(this.MSG_CHANNEL_NAME, {
              ok: false,
              miner_id: id,
              error,
            });
          },
        });
    });
  }
}
