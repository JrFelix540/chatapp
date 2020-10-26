import { MikroORM } from "@mikro-orm/core";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import path from "path";
export default {
    entities: [Message, User],
    dbName: "chatapp",
    user: "saleor",
    password: "saleor",
    type: "postgresql",
    debug: true,
    migrations: {
        pattern: /^[\w-]+\d+\.[tj]s$/,
        path: path.join(__dirname, "./migrations")
    }
} as Parameters<typeof MikroORM.init>[0];
