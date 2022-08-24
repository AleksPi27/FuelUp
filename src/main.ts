import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FuelService } from './fuel/fuel.service';
import { StationService } from './station/station.service';

const logger: Logger = new Logger();

async function bootstrap() {
  logger.log(`Bootstraping application...`);
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  const stationService = app.get(StationService);
  const fuelService = app.get(FuelService);
  await getStations(stationService);
  await getFuelPrices(fuelService);
  logger.log(`Finishing application...`);
}
bootstrap();

async function getStations(stationService: StationService): Promise<void>{
  await stationService.getStations();
  await stationService.processStations();
}

async function getFuelPrices(fuelService: FuelService): Promise<void>{
  logger.log(`Getting all fuel prices`);
  await fuelService.getStationsforFuelPrices();
  await fuelService.processFuelPrices();
}