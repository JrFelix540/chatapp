import { User } from "../entities/User";
import { MyContext } from "../types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from "argon2";
import { USERID_COOKIE } from "../constants";

@ObjectType()
export class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
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

        return {
            user
        };
    }
    @Mutation(() => UserResponse)
    async login(
        @Ctx() { em, req }: MyContext,
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

        req.session.userId = user.id;

        return {
            user
        };
    }
    @Mutation(() => Boolean)
    async logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
        return new Promise((resolve) =>
            req.session.destroy((err) => {
                res.clearCookie(USERID_COOKIE);
                if (err) {
                    console.log(err);
                }

                return resolve(true);
            })
        );
    }

    @Query(() => [User])
    async users(@Ctx() { em }: MyContext): Promise<User[]> {
        const users = await em.find(User, {});
        return users;
    }
}
