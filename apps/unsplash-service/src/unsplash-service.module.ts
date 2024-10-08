import { Module } from '@nestjs/common';
import { UnsplashServiceController } from './unsplash-service.controller';
import { UnsplashServiceService } from './unsplash-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { SharedModule } from '@app/shared';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
  ],
  controllers: [UnsplashServiceController],
  providers: [
    UnsplashServiceService,
    {
      provide: 'JOB_SERVICE',
      useFactory: (configService: ConfigService) => {
        const USER = configService.get('RABBITMQ_USER');
        const PASSWORD = configService.get('RABBITMQ_PASS');
        const HOST = configService.get('RABBITMQ_HOST');
        const QUEUE = configService.get('RABBITMQ_JOB_QUEUE');
        const DLQ = configService.get('RABBITMQ_DLQ_QUEUE');

        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${USER}:${PASSWORD}@${HOST}`],
            noAck: true,
            queue: QUEUE,
            queueOptions: {
              durable: true,
              deadLetterExchange: '',
              deadLetterRoutingKey: DLQ,
              messageTtl: 60000,
            },
          },
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class UnsplashServiceModule {}
