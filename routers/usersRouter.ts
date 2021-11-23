import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../service";
import Game from "../model/game";
import User from "../model/user";

export const usersRouter = express.Router();

usersRouter.use(express.json());

usersRouter.get("/", async (req: Request, res: Response) => {
    try {
        const users = (await collections.users?.find({}).toArray()) as unknown as User[];
        res.status(200).send(users);
    } catch (error: unknown) {
        res.status(500).send((error as Error).message);
    }
});

usersRouter.get("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;
    try {
        const query = { _id: new ObjectId(id) };
        const user = (await collections.users?.findOne(query)) as unknown as User;

        if (user) {
            res.status(200).send(user);
        }
    } catch (error) {
        res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
    }
});

usersRouter.post("/", async (req: Request, res: Response) => {
    try {
        const newUser = req.body as User;
        const result = await collections.users?.insertOne(newUser);
        result
            ? res.status(201).send({"id": result.insertedId})
            : res.status(500).send("Failed to create a new user.");
    } catch (error) {
        console.error(error);
        res.status(400).send((error as Error).message);
    }
});

usersRouter.put("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        const updatedUser: User = req.body as User;
        const query = { _id: new ObjectId(id) };
      
        const result = await collections.users?.updateOne(query, { $set: updatedUser });

        result
            ? res.status(200).send(`Successfully updated user with id ${id}`)
            : res.status(304).send(`User with id: ${id} not updated`);
    } catch (error: unknown) {
        res.status(400).send((error as Error).message);
    }
});

usersRouter.delete("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        const query = { _id: new ObjectId(id) };
        const result = await collections.users?.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed user with id ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove user with id ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`User with id ${id} does not exist`);
        }
    } catch (error: unknown) {
        res.status(400).send((error as Error).message);
    }
});

usersRouter.get("/:id/games", async (req: Request, res: Response) => {
    const id = req?.params?.id;
    try {
        const query = { _id: new ObjectId(id) };
        const user = (await collections.users?.findOne(query)) as unknown as User;

        if (user) {
            res.status(200).send(user.games);
        }
    } catch (error) {
        res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
    }
});