import { User } from "../entities/User";
import { MyContext } from "../types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { USERID_COOKIE } from "../constants";

@ObjectType()
export class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => String, { nullable: true })
    token?: string;
}

@ObjectType()
export class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@Resolver()
export class UserResolver {
    @Query(() => String)
    hello() {
        return `Hello it's me, Jacob`;
    }
    @Mutation(() => UserResponse)
    async register(
        @Ctx() { em }: MyContext,
        @Arg("username") username: string,
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<UserResponse> {
        const hashedPassword = await argon2.hash(password);

        const user = new User();
        user.username = username;
        user.email = email;
        user.password = hashedPassword;
        const newEm = em.fork(false);
        await newEm.begin();
        try {
            newEm.persist(user);
            await newEm.commit();
        } catch (err) {
            console.log(err);
            await newEm.rollback();

            if (
                err.detail.includes("already exists") &&
                err.constraint === "user_username_unique"
            ) {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "username already exists"
                        }
                    ]
                };
            }

            if (err.detail.includes("already exists") && err.constraint === "user_email_unique") {
                return {
                    errors: [
                        {
                            field: "email",
                            message: "A user of this email already exists"
                        }
                    ]
                };
            }
        }

        const token = jwt.sign({ email }, USERID_COOKIE, {
            expiresIn: 60 * 60
        });

        return {
            token
        };
    }
    @Mutation(() => UserResponse)
    async login(
        @Ctx() { em }: MyContext,
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string
    ): Promise<UserResponse> {
        const user = usernameOrEmail.includes(`@`)
            ? await em.findOne(User, {
                  email: usernameOrEmail
              })
            : await em.findOne(User, {
                  username: usernameOrEmail
              });

        if (!user) {
            return {
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: "Incorrect username or email"
                    }
                ]
            };
        }

        const verifyPassword = await argon2.verify(user.password, password);

        if (!verifyPassword) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "Incorrect Password"
                    }
                ]
            };
        }

        const email = user.email;

        const token = jwt.sign({ email }, USERID_COOKIE, {
            expiresIn: 60 * 60
        });

        return {
            token
        };
    }
    @Mutation(() => Boolean)
    async logout() {}

    @Query(() => [User])
    async users(@Ctx() { em }: MyContext): Promise<User[]> {
        const users = await em.find(User, {});
        return users;
    }

    @Query(() => User, { nullable: true })
    async me(@Ctx() { req, em }: MyContext) {
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
            return null;
        }
        const currentUser = await em.findOne(User, { email: user.email });

        return currentUser;
    }

    @Mutation(() => Boolean)
    async deleteUsers(@Ctx() { em }: MyContext): Promise<boolean> {
        await em.nativeDelete(User, {});
        return true;
    }
}
