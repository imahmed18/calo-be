import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobModule } from './job/job.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    JobModule,
  ],
  providers: [],
})
export class AppModule {}
