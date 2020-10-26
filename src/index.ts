import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import mikroconfig from "./config/mikro-orm.config";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import express from "express";
import { UserResolver } from "./resolvers/user";

const main = async () => {
    const orm = await MikroORM.init(mikroconfig);

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver],
            validate: false
        }),

        context: ({ req, res }) => ({
            req,
            res,
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
