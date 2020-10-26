import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Float, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Message {
    @Field()
    @PrimaryKey()
    id!: number;

    @Field()
    @Property()
    content!: string;

    @Field(() => Float)
    @Property()
    senderId!: number;

    @Field(() => Float)
    @Property()
    receiverId!: number;

    @Field(() => String)
    @Property({ type: "date" })
    createdAt = new Date();

    @Field(() => String)
    @Property({ onUpdate: () => new Date(), type: "date" })
    updatedAt = new Date();
}
