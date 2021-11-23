import express from "express";
import { connectToDatabase } from "./service"
import { gamesRouter } from "./routers/gamesRouter";
import { usersRouter } from "./routers/usersRouter";

const app = express();

connectToDatabase()
    .then(() => {
        app.use("/games", gamesRouter);
        app.use("/users", usersRouter);
        app.listen(3000, () => {
            console.log("Express started");
        });
    })
    .catch((error: Error) => {
        console.log("Database connection failed", error);
    });
