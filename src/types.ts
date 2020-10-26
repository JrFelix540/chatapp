import { IDatabaseDriver, Connection, EntityManager } from "@mikro-orm/core";
import { Request, Response } from "express";

export type MyContext = {
    req: Request;
    res: Response;
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
};
