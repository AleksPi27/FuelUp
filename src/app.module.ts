import { HttpService } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FuelService } from './fuel/fuel.service';
import { FuelSupplementService } from './fuelSupplement/fuelSupplement.service';
import { StationService } from './station/station.service';

@Module({
  controllers: [AppController],
  providers: [StationService, FuelSupplementService, FuelService],
})
export class AppModule {}
