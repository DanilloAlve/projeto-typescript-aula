import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Sensor } from "./Sensor.js";

@Entity("leitura")
export default class Leitura {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "float", nullable: false })
    umidade!: number;

    @Column({ type: "float", nullable: false })
    temperatura!: number;

    @Column({ type: "timestamp", nullable: false })
    dataHora!: Date;

    @ManyToOne(() => Sensor, (sensor) => sensor.leituras)
    @JoinColumn({ name: "sensor_id" })
    sensor!:  Relation<Sensor>;

}