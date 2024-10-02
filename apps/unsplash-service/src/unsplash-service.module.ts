import { Module } from '@nestjs/common';
import { UnsplashServiceController } from './unsplash-service.controller';
import { UnsplashServiceService } from './unsplash-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    HttpModule,
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
export class UnsplashServiceModule {}
