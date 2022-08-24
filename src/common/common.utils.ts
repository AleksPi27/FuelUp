import { readFile } from 'fs/promises';
import { uuid } from 'uuidv4';

export function generateUuidV4(): string {
    return uuid();
}

export async function getSavedCollection(origin:string): Promise<any[]>{
    const savedEntitiesString: string = await readFile(origin, 'utf-8');
    return JSON.parse(savedEntitiesString);
  }