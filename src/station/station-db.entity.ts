import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import {Fuel} from '../fuel/fuel-db.entity';
import {FuelSupplement} from '../fuelSupplement/fuelSupplement-db.entity';

@Entity()
export class Station{
    @PrimaryGeneratedColumn("uuid")
    stationId: string;

    @Column()
    apiId: string;
    
    @Column()
    name: string;

    @Column()
    address: string;

    @Column()
    brand: string;

    @Column()
    brandId: string;

    @Column()
    location: Location;

    @Column()
    takeOffBefore: string;

    @Column()
    postPay: boolean;

    @Column()
    enable: boolean;

    @OneToMany(()=> FuelSupplement, (fuelSupplement)=> fuelSupplement.station)
    columns: FuelSupplement[];

    @OneToMany(()=> Fuel, (fuel) => fuel.station)
    fuels: Fuel[];
}

class Location {
    Longitude: number;
    Latitude: number;
}


