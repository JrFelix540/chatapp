import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {
    @Field()
    @PrimaryKey()
    id!: number;

    @Field()
    @Property()
    username!: string;

    @Field()
    @Property({ unique: true })
    email!: string;

    @Field(() => String)
    @Property({ type: "date" })
    createdAt = new Date();

    @Property()
    password!: string;

    @Field(() => String)
    @Property({ onUpdate: () => new Date(), type: "date" })
    updatedAt = new Date();
}
