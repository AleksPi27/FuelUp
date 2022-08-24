import { FuelSupplement } from "src/fuelSupplement/fuelSupplement-db.entity";
import { Station } from "src/station/station-db.entity";
import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

@Entity()
export class Fuel{
    @PrimaryGeneratedColumn("uuid")
    fuelId: string;

    @Column()
    apiId: string;

    @Column()
    price: number;
    
    @Column()
    type: string;

    @Column()
    typeId: number;

    @Column()
    brand: string;

    @Column()
    name: string;

    @ManyToOne(()=> FuelSupplement, (fuelSupplement)=>fuelSupplement.fuels)
    fuelSupplement: FuelSupplement;

    @ManyToOne(()=>Station, (station)=>station.fuels)
    station: Station;
}