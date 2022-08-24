import {IsString} from 'class-validator';

export class QueryParams{
    @IsString()
    apikey: string;
}