import { Collection, Entity, ManyToMany, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { Chat } from "./Chat";
import { Message } from "./Message";

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

    @Field(() => [Message])
    @OneToMany(() => Message, (message) => message.sender, { orphanRemoval: true })
    sentMessages = new Collection<Message>(this);

    @Field(() => [Message])
    @OneToMany(() => Message, (message) => message.receiver, { orphanRemoval: true })
    receivedMessages = new Collection<Message>(this);

    @Field(() => String)
    @Property({ type: "date" })
    createdAt = new Date();

    @Property()
    password!: string;

    @Field(() => String)
    @Property({ onUpdate: () => new Date(), type: "date" })
    updatedAt = new Date();

    @Field(() => [Chat])
    @ManyToMany(() => Chat, "users", { owner: true })
    chats = new Collection<Chat>(this);
}
