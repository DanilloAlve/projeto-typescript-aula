import { type Relation, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Pesquisador from "./Pesquisador.js";

@Entity("refreshtoken")
export default class RefreshToken {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar" , nullable: false, length: 255})
    jti: string;

    @Column({ type: "varchar", nullable: true })
    sessionId: string;

    @Column({ type: "varchar", nullable: true })
    userAgent: string;

    @Column({ type: "varchar", nullable: true })
    ipAddress: string;

    @Column({ type: "varchar", nullable: true, length: 255 })
    tokenhash: string;

    @Column({  type: 'timestamp', nullable: true })
    expireIn: Date;

    @Column({ type: "boolean",  default: true })
    revoked:  boolean;

    @ManyToOne(() => Pesquisador, { onDelete: 'CASCADE' })
    pesquisador:  Relation<Pesquisador>;

    @CreateDateColumn()
    createAt: Date;

}