import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../service";
import Game from "../model/game";

export const gamesRouter = express.Router();

gamesRouter.use(express.json());

gamesRouter.get("/", async (req: Request, res: Response) => {
    try {
        const games = (await collections.games?.find({}).toArray()) as unknown as Game[];
        res.status(200).send(games);
    } catch (error: unknown) {
        res.status(500).send((error as Error).message);
    }
});

gamesRouter.get("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;
    try {
        const query = { _id: new ObjectId(id) };
        const game = (await collections.games?.findOne(query)) as unknown as Game;

        if (game) {
            res.status(200).send(game);
        }
    } catch (error) {
        res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
    }
});

gamesRouter.post("/", async (req: Request, res: Response) => {
    try {
        const newGame = req.body as Game;
        const result = await collections.games?.insertOne(newGame);
        result
            ? res.status(201).send({"id": result.insertedId})
            : res.status(500).send("Failed to create a new game.");
    } catch (error) {
        console.error(error);
        res.status(400).send((error as Error).message);
    }
});

gamesRouter.put("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        const updatedGame: Game = req.body as Game;
        const query = { _id: new ObjectId(id) };
      
        const result = await collections.games?.updateOne(query, { $set: updatedGame });

        result
            ? res.status(200).send(`Successfully updated game with id ${id}`)
            : res.status(304).send(`Game with id: ${id} not updated`);
    } catch (error: unknown) {
        res.status(400).send((error as Error).message);
    }
});

gamesRouter.delete("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        const query = { _id: new ObjectId(id) };
        const result = await collections.games?.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed game with id ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove game with id ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Game with id ${id} does not exist`);
        }
    } catch (error: unknown) {
        res.status(400).send((error as Error).message);
    }
});

