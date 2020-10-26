import { IDatabaseDriver, Connection, EntityManager } from "@mikro-orm/core";
import { Request, Response } from "express";
import { Redis } from "ioredis";

export type MyContext = {
    req: Request & { session: Express.Session };
    res: Response;
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
    redis: Redis;
};
