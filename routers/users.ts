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
        if (!newUser.games){
            newUser.games = [];
        }
        for (let i = 0; i < newUser.games.length; i++){
            if (!newUser.games[i].playTime){
                newUser.games[i].playTime = 0;
            }
        }
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
        var games: Game[] = [];
        var records: {game: Game, playTime: number}[] = [];
        if (user) {
            for (let i = 0; i < user.games.length; i++){
                const game = (await collections.games?.findOne({ _id: new ObjectId(user.games[i].game) })) as unknown as Game;
                games.push(game);
            }
            for (let i = 0; i < user.games.length; i++){
                records.push({game: games[i], playTime: user.games[i].playTime ?? 0});
            }
            res.status(200).send({ games: records });
        }
    } catch (error) {
        res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
    }
});

usersRouter.post("/:id/games", async (req: Request, res: Response) => {
    const userId = req?.params?.id;
    try {
        const gameId = req.body.id;
        const playtime = await getFromBackup(userId, gameId);
        const query = { _id: new ObjectId(userId) };
        const game = (await collections.games?.findOne({ _id: new ObjectId(gameId) })) as unknown as Game;
        if (game) {
            const result = await collections.users?.updateOne(query, { $push: { "games": { "game" : gameId, "playTime": playtime }}});
            result
            ? res.status(201).send({})
            : res.status(500).send("Failed to create a new user.");
        }
        else{
            res.status(500).send(`No game ${gameId} found`);
        }
    } catch (error) {
        console.error(error);
        res.status(400).send((error as Error).message);
    }
});

usersRouter.post("/:id/games/:gid", async (req: Request, res: Response) => {
    const userId = req?.params?.id;
    try {
        const gameId = req?.params?.gid;
        var playtime = req.body.playTime;
        const result = await collections.users?.updateOne({_id: new ObjectId(userId), 'games': { $elemMatch: { game: gameId}}}, {$set: { "games.$.playTime" : playtime}});
        result
        ? res.status(201).send({})
        : res.status(500).send("Failed to update play time.");
    } catch (error) {
        console.error(error);
        res.status(400).send((error as Error).message);
    }
});

usersRouter.delete("/:id/games/:gid", async (req: Request, res: Response) => {
    const userId = req?.params?.id;
    try {
        const gameId = req?.params?.gid;
        const gameItem = await collections.users?.findOne({_id: new ObjectId(userId), 'games': { $elemMatch: { game: gameId}}}) as unknown as {game: string, playTime: number};
        if (gameItem){
            console.info(gameItem);
            backup(userId, gameId, gameItem.playTime);
        }
        const result = await collections.users?.updateOne({_id: new ObjectId(userId)} , { $pull : {'games': { game: gameId}}});
        result
        ? res.status(201).send({})
        : res.status(500).send("Failed to update play time.");
    } catch (error) {
        console.error(error);
        res.status(400).send((error as Error).message);
    }
});

const backup = (async (userId: string, gameId: string, playtime: number) => { 
    const result = await collections.backup?.insertOne({userId: userId, gameId: gameId, playTime: playtime});
})

const getFromBackup = (async (userId: string, gameId: string) => { 
    let result = 0;
    const backupRecord = await collections.backup?.findOne({userId: userId, gameId: gameId}) as unknown as {userId: string, gameId: string, playtime: number};
    if (backupRecord){
        result = backupRecord.playtime;
    }
    return result;
})