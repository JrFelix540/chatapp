import { Property, Entity, PrimaryKey, OneToMany, Collection, ManyToMany } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { Message } from "./Message";
import { User } from "./User";

@ObjectType()
@Entity()
export class Chat {
    @Field()
    @PrimaryKey()
    id!: number;

    @Field(() => String)
    @Property({ type: "date" })
    createdAt = new Date();

    @Field(() => [Message])
    @OneToMany(() => Message, (message) => message.chat, { orphanRemoval: true })
    messages = new Collection<Message>(this);

    @Field(() => [User])
    @ManyToMany(() => User, (user) => user.chats)
    users = new Collection<User>(this);
}
