import { Cascade, Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { Chat } from "./Chat";
import { User } from "./User";

@ObjectType()
@Entity()
export class Message {
    @Field()
    @PrimaryKey()
    id!: number;

    @Field()
    @Property()
    content!: string;

    @Field(() => User)
    @ManyToOne(() => User, { cascade: [Cascade.REMOVE], nullable: true })
    receiver: User;

    @Field(() => User)
    @ManyToOne(() => User, { cascade: [Cascade.REMOVE], nullable: true })
    sender: User;

    @Field(() => Chat)
    @ManyToOne(() => Chat, { cascade: [Cascade.REMOVE], nullable: true })
    chat: Chat;

    @Field(() => String)
    @Property({ type: "date" })
    createdAt = new Date();

    @Field(() => String)
    @Property({ onUpdate: () => new Date(), type: "date" })
    updatedAt = new Date();
}
