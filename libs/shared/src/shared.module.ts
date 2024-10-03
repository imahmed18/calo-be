import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {}
