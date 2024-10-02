import { Module } from '@nestjs/common';
import { JobServiceController } from './job-service.controller';
import { JobServiceService } from './job-service.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
  ],
  controllers: [JobServiceController],
  providers: [JobServiceService],
})
export class JobServiceModule {}
