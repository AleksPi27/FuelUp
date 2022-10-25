import { appendFile, open } from 'fs';
import { readFile } from 'fs/promises';
import { FuelandFuelSupplementDb, FuelPriceDb } from 'src/fuel/fuel.interface';
import { FuelSupplementDb } from 'src/fuelSupplement/fuelSupplement.interface';
import { StationDb } from 'src/station/station.interface';
import { uuid } from 'uuidv4';

export function generateUuidV4(): string {
    return uuid();
}

export async function getSavedCollection(origin:string): Promise<any[]>{
    const savedEntitiesString: string = await readFile(origin, 'utf-8');
    return JSON.parse(savedEntitiesString);
}

export function saveToFile(path: string, contentToBeSaved: StationDb[] | FuelSupplementDb[] | FuelPriceDb[] | FuelandFuelSupplementDb[]): void {
    appendFile(
      path,
      JSON.stringify(contentToBeSaved, null, '\t'),
      (err) => {
        if (err) {
          throw new Error(`Error while saving to the file: ${err}`);
        }
      },
    );
}

export function createFile(path: string): void {
    open(path, 'w', (err) => {
        if (err) {
          throw new Error(`Error while creating a file: ${err.message}`);
        }
      });
}