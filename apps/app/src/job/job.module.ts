import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  controllers: [JobController],
  providers: [
    JobService,
    {
      provide: 'JOB_SERVICE',
      useFactory: (configService: ConfigService) => {
        const USER = configService.get('RABBITMQ_USER');
        const PASSWORD = configService.get('RABBITMQ_PASS');
        const HOST = configService.get('RABBITMQ_HOST');
        const QUEUE = configService.get('RABBITMQ_JOB_QUEUE');

        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${USER}:${PASSWORD}@${HOST}`],
            noAck: true,
            queue: QUEUE,
            queueOptions: {
              durable: true,
            },
          },
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class JobModule {}
