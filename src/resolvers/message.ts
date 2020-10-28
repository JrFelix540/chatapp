import { Message } from "../entities/Message";
import { MyContext } from "../types";
import { Arg, Ctx, Query, Resolver, Mutation, ObjectType, Field, Int } from "type-graphql";
import jwt from "jsonwebtoken";
import { USERID_COOKIE } from "../constants";
import { User } from "../entities/User";
import { FieldError } from "./user";
import { Chat } from "../entities/Chat";

@ObjectType()
export class MessageResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => Message, { nullable: true })
    message?: Message;
}

@Resolver()
export class MessageResolver {
    @Mutation(() => MessageResponse)
    async CreateMessage(
        @Ctx() { em, req }: MyContext,
        @Arg("receiverId") receiverId: number,
        @Arg("content") content: string,
        @Arg("chatId", () => Int, { nullable: true }) chatId: number
    ): Promise<MessageResponse> {
        let user;
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(`Bearer `)[1];
            jwt.verify(token, USERID_COOKIE, (err, decodedToken) => {
                if (err) {
                    return null;
                }

                user = decodedToken;
                return;
            });
        }

        if (!user) {
            return {
                errors: [
                    {
                        field: "senderId",
                        message: "Sender not valid"
                    }
                ]
            };
        }
        const currentUser = await em.findOne(User, { email: user.email });

        if (!currentUser) {
            return {
                errors: [
                    {
                        field: "senderId",
                        message: "Sender not valid"
                    }
                ]
            };
        }

        const receiver = await em.findOne(User, { id: receiverId });

        if (!receiver) {
            return {
                errors: [
                    {
                        field: "receriverId",
                        message: "Receiver not valid"
                    }
                ]
            };
        }

        const message = new Message();
        message.receiver = receiver;
        message.sender = currentUser;
        message.content = content;

        const newEm = em.fork(false);
        await newEm.begin();

        try {
            newEm.persist(message);
            await newEm.commit();
        } catch (err) {
            console.log(err);
            return {
                errors: [
                    {
                        field: "error",
                        message: "check console for error"
                    }
                ]
            };
        }

        if (!chatId) {
            const chat = new Chat();
            chat.messages.add(message);
            chat.users.add(receiver);
            chat.users.add(currentUser);
            const chatRepository = em.getRepository(Chat);
            try {
                await chatRepository.persistAndFlush(chat);
            } catch (err) {
                console.log(err);
                return {
                    errors: [
                        {
                            field: "Chat",
                            message: "Failed to create message. see console"
                        }
                    ]
                };
            }

            return {
                message
            };
        }

        const chatRepository = em.getRepository(Chat);
        const chat = await chatRepository.findOne({ id: chatId });

        if (!chat) {
            return {
                errors: [
                    {
                        field: "Chat",
                        message: "Could not find chat"
                    }
                ]
            };
        }

        chat.messages.add(message);

        try {
            chatRepository.persistAndFlush(chat);
        } catch (err) {
            console.log(err);
            return {
                errors: [
                    {
                        field: "chat",
                        message: "check console for error"
                    }
                ]
            };
        }

        return {
            message
        };
    }

    @Query(() => [Chat])
    async fetchChats(@Ctx() { em }: MyContext) {
        const chatRepository = em.getRepository(Chat);
        const chats = await chatRepository.findAll(["messages", "users"]);

        return chats;
    }

    @Query(() => Chat)
    async fetchChat(@Ctx() { em }: MyContext, @Arg("chatId") chatId: number) {
        const chatRepository = em.getRepository(Chat);
        const chat = await chatRepository.findOne({ id: chatId }, ["messages", "users"]);

        return chat;
    }

    @Query(() => [Message])
    async fetchMessages(@Ctx() { em }: MyContext) {
        const messageRepository = em.getRepository(Message);
        return messageRepository.findAll();
    }

    @Mutation(() => Boolean)
    async deleteChat(@Ctx() { em }: MyContext, @Arg("chatId") chatId: number): Promise<boolean> {
        const chatRepository = em.getRepository(Chat);
        try {
            await chatRepository.nativeDelete({ id: chatId });
        } catch (err) {
            console.log(err);
        }

        return true;
    }

    @Mutation(() => Boolean)
    async deleteMessage(@Ctx() { em }: MyContext, @Arg("messageId") messageId: number) {
        const messageRepository = em.getRepository(Message);
        try {
            await messageRepository.nativeDelete({ id: messageId });
        } catch (err) {
            console.log(err);
        }

        return true;
    }
}
