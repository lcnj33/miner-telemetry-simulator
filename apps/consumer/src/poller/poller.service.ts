import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { Cron, Interval } from '@nestjs/schedule';
import { Telemetry } from 'apps/producer/src/telemetry/telemetry.interface';
import { ErrorMessage, SuccessMessage } from './poller.interface';

@Injectable()
export class PollerService {
  private readonly logger = new Logger(PollerService.name);
  private readonly TELEMETRY_ENDPOINT = 'http://localhost:3000/telemetry';
  private readonly MSG_CHANNEL_NAME = 'telemetry';

  private minerIds: string[] = [];

  constructor(
    private httpService: HttpService,
    @Inject('PUBSUB') private client: ClientProxy,
  ) {}

  @Cron('5 * * * * *')
  handleCron() {
    this.logger.debug('Polling miner IDs...');
    this.httpService.get(this.TELEMETRY_ENDPOINT).subscribe({
      next: (resp) => {
        this.logger.debug(JSON.stringify(resp.data));
        this.minerIds = resp.data;
      },
      error: (error) => {
        this.logger.debug(JSON.stringify(error));
      },
    });
  }

  @Interval(10000)
  handleInterval() {
    this.logger.debug('Polling miner metrics...');

    this.minerIds.forEach((id) => {
      this.httpService
        .get<Telemetry>(`${this.TELEMETRY_ENDPOINT}/${id}`)
        .subscribe({
          next: (resp) => {
            this.logger.debug(JSON.stringify(resp.data));
            // TODO: using prefix + fleetId as the channel name for scalibility
            this.client.emit<undefined, SuccessMessage>(this.MSG_CHANNEL_NAME, {
              ok: true,
              miner_id: id,
              data: resp.data,
            });
          },
          error: (error) => {
            this.logger.debug(
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
