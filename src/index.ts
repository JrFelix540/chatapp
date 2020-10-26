import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import mikroconfig from "./config/mikro-orm.config";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import express from "express";
import connectRedis from "connect-redis";
import Redis from "ioredis";
import cors from "cors";
import session from "express-session";
import { UserResolver } from "./resolvers/user";
import { USERID_COOKIE } from "./constants";

const main = async () => {
    const orm = await MikroORM.init(mikroconfig);

    const app = express();

    //Redis setup
    const redis = new Redis();
    const RedisStore = connectRedis(session);

    app.use(
        session({
            name: USERID_COOKIE,
            store: new RedisStore({
                client: redis,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24,
                sameSite: "lax",
                secure: false
            },
            saveUninitialized: false,
            secret: "test"
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver],
            validate: false
        }),

        context: ({ req, res }) => ({
            req,
            res,
            redis,
            em: orm.em
        })
    });

    apolloServer.applyMiddleware({
        app,
        cors: false
    });

    app.listen(4000, () => {
        console.log(`Server running at port 4001`);
    });
};

main().catch((err) => console.log(err));
