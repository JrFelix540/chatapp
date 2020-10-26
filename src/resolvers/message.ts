import { Message } from "src/entities/Message";
import { MyContext } from "src/types";
import { Ctx, Query, Resolver } from "type-graphql";

@Resolver()
export class MessageResolver {
    @Query(() => [Message])
    messages() {}
}
